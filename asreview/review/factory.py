# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from pathlib import PurePath
from pathlib import Path
from datetime import datetime
import json

import numpy as np

from asreview.models.balance.utils import get_balance_model
from asreview.compat import convert_id_to_idx
from asreview.config import LABEL_NA
from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_FEATURE_EXTRACTION
from asreview.config import DEFAULT_MODEL
from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import DEFAULT_N_PRIOR_EXCLUDED
from asreview.config import DEFAULT_N_PRIOR_INCLUDED
from asreview.config import DEFAULT_QUERY_STRATEGY
from asreview.config import EMAIL_ADDRESS
from asreview.config import GITHUB_PAGE
from asreview.data import ASReviewData
from asreview.data import load_data
from asreview.io.paper_record import preview_record
from asreview.models.feature_extraction import get_feature_model
from asreview.models.classifiers import get_classifier
from asreview.models.query import get_query_model
from asreview.review.simulate import ReviewSimulate
from asreview.settings import ASReviewSettings
from asreview.state.utils import init_project_folder_structure
from asreview.state.paths import get_data_path
from asreview.state.paths import get_project_file_path
from asreview.utils import get_random_state


ASCII_LOGO = """
            _____ _____            _
     /\    / ____|  __ \          (_)
    /  \  | (___ | |__) |_____   ___  _____      __
   / /\ \  \___ \|  _  // _ \ \ / / |/ _ \ \ /\ / /
  / ____ \ ____) | | \ \  __/\ V /| |  __/\ V  V /
 /_/    \_\_____/|_|  \_\___| \_/ |_|\___| \_/\_/
"""  # noqa

ASCII_MSG_SIMULATE = """
---------------------------------------------------------------------------------
|                                                                                |
|  Welcome to the ASReview Automated Systematic Review software.                 |
|  In this mode the computer will simulate how well the ASReview software        |
|  could have accelerate the systematic review of your dataset.                  |
|  You can sit back and relax while the computer runs this simulation.           |
|                                                                                |
|  GitHub page:        {0: <58}|
|  Questions/remarks:  {1: <58}|
|                                                                                |
---------------------------------------------------------------------------------
""".format(GITHUB_PAGE, EMAIL_ADDRESS)  # noqa


def _add_defaults(set_param, default_param):
    set_param.update({
        key: value
        for key, value in default_param.items() if key not in set_param
    })


def review_simulate(dataset, *args, **kwargs):
    """CLI simulate mode."""

    print(ASCII_LOGO + ASCII_MSG_SIMULATE)

    state_fp = kwargs.pop('state_file')

    if state_fp is None:
        raise ValueError(
            "Specify project file name (with .asreview extension).")

    init_project_folder_structure(state_fp, project_mode='simulate')

    reviewer = get_simulate_reviewer(dataset, state_fp, *args, **kwargs)

    # output the prior indices
    print("The following records are prior knowledge:\n")
    for prior_record_id in reviewer.start_idx:
        preview = preview_record(reviewer.as_data.record(prior_record_id))
        print(f"{prior_record_id} - {preview}")

    # Start the review process.
    reviewer.review()

    # Mark review as finished.
    review_finished(state_fp)


def get_simulate_reviewer(dataset,
                          state_file,
                          model=DEFAULT_MODEL,
                          query_strategy=DEFAULT_QUERY_STRATEGY,
                          balance_strategy=DEFAULT_BALANCE_STRATEGY,
                          feature_extraction=DEFAULT_FEATURE_EXTRACTION,
                          n_instances=DEFAULT_N_INSTANCES,
                          n_papers=None,
                          n_queries=None,
                          embedding_fp=None,
                          verbose=0,
                          prior_idx=None,
                          prior_record_id=None,
                          n_prior_included=DEFAULT_N_PRIOR_INCLUDED,
                          n_prior_excluded=DEFAULT_N_PRIOR_EXCLUDED,
                          config_file=None,
                          model_param=None,
                          query_param=None,
                          balance_param=None,
                          feature_param=None,
                          seed=None,
                          included_dataset=[],
                          excluded_dataset=[],
                          prior_dataset=[],
                          new=False,
                          **kwargs):
    """Get a review object from arguments.

    See __main__.py for a description of the arguments.
    """
    as_data = load_data(dataset)

    if len(as_data) == 0:
        raise ValueError("Supply at least one dataset"
                         " with at least one record.")

    # Add the dataset to the project file.
    as_data.to_csv(Path(get_data_path(state_file), f'{as_data.data_name}.csv'))

    # create a new settings object from arguments
    settings = ASReviewSettings(model=model,
                                n_instances=n_instances,
                                n_queries=n_queries,
                                n_papers=n_papers,
                                n_prior_included=n_prior_included,
                                n_prior_excluded=n_prior_excluded,
                                query_strategy=query_strategy,
                                balance_strategy=balance_strategy,
                                feature_extraction=feature_extraction,
                                mode="simulate",
                                data_fp=None)
    settings.from_file(config_file)

    if n_queries is not None:
        settings.n_queries = n_queries
    if n_papers is not None:
        settings.n_papers = n_papers

    if model_param is not None:
        settings.model_param = model_param
    if query_param is not None:
        settings.query_param = query_param
    if balance_param is not None:
        settings.balance_param = balance_param
    if feature_param is not None:
        settings.feature_param = feature_param

    # Initialize models.
    random_state = get_random_state(seed)
    train_model = get_classifier(settings.model,
                                 **settings.model_param,
                                 random_state=random_state)
    query_model = get_query_model(settings.query_strategy,
                                  **settings.query_param,
                                  random_state=random_state)
    balance_model = get_balance_model(settings.balance_strategy,
                                      **settings.balance_param,
                                      random_state=random_state)
    feature_model = get_feature_model(settings.feature_extraction,
                                      **settings.feature_param,
                                      random_state=random_state)

    # LSTM models need embedding matrices.
    if train_model.name.startswith("lstm-"):
        texts = as_data.texts
        train_model.embedding_matrix = feature_model.get_embedding_matrix(
            texts, embedding_fp)

    # prior knowledge
    if prior_idx is not None and prior_record_id is not None and \
            len(prior_idx) > 0 and len(prior_record_id) > 0:
        raise ValueError(
            "Not possible to provide both prior_idx and prior_record_id")
    if prior_record_id is not None and len(prior_record_id) > 0:
        prior_idx = convert_id_to_idx(as_data, prior_record_id)

    # Initialize the review class.
    reviewer = ReviewSimulate(as_data,
                              model=train_model,
                              query_model=query_model,
                              balance_model=balance_model,
                              feature_model=feature_model,
                              n_papers=settings.n_papers,
                              n_instances=settings.n_instances,
                              n_queries=settings.n_queries,
                              prior_idx=prior_idx,
                              n_prior_included=settings.n_prior_included,
                              n_prior_excluded=settings.n_prior_excluded,
                              state_file=state_file,
                              **kwargs)

    return reviewer


def review_finished(project_path, review_id=None):
    """Mark a review in the project as finished. If no review_id is given,
    mark the first review as finished.

    Arguments
    ---------
    project_path: pathlike
        Path to the project folder.
    review_id: str
        Identifier of the review to mark as finished.
    """
    project_path = Path(project_path)
    with open(get_project_file_path(project_path), 'r') as f:
        project_config = json.load(f)

    if review_id is None:
        review_index = 0
    else:
        review_index = [x['id']
                        for x in project_config['reviews']].index(review_id)

    project_config['reviews'][review_index]['review_finished'] = True
    project_config['reviews'][review_index]['end_time'] = str(datetime.now())

    with open(get_project_file_path(project_path), 'w') as f:
        json.dump(project_config, f)
