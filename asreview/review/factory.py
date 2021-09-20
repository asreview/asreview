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

import json
import logging
from os.path import splitext
from pathlib import PurePath

import numpy as np

from asreview.models.balance.utils import get_balance_model
from asreview.compat import convert_id_to_idx
from asreview.config import AVAILABLE_CLI_MODI, LABEL_NA
from asreview.config import AVAILABLE_REVIEW_CLASSES
from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_FEATURE_EXTRACTION
from asreview.config import DEFAULT_MODEL
from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import DEFAULT_N_PRIOR_EXCLUDED
from asreview.config import DEFAULT_N_PRIOR_INCLUDED
from asreview.config import DEFAULT_QUERY_STRATEGY
from asreview.config import EMAIL_ADDRESS
from asreview.config import GITHUB_PAGE
from asreview.config import KERAS_MODELS
from asreview.data import ASReviewData
from asreview.data import load_data
from asreview.io.paper_record import preview_record
from asreview.models.feature_extraction import get_feature_model
from asreview.models.classifiers import get_classifier
from asreview.models.query import get_query_model
from asreview.review.minimal import MinimalReview
from asreview.review.simulate import ReviewSimulate
from asreview.settings import ASReviewSettings
from asreview.state.utils import open_state
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


def create_as_data(dataset,
                   included_dataset=[],
                   excluded_dataset=[],
                   prior_dataset=[],
                   new=False):
    """Create ASReviewData object from multiple datasets."""
    if isinstance(dataset, (str, PurePath)):
        dataset = [dataset]

    if isinstance(included_dataset, (str, PurePath)):
        included_dataset = [included_dataset]

    if isinstance(excluded_dataset, (str, PurePath)):
        excluded_dataset = [excluded_dataset]

    if isinstance(prior_dataset, (str, PurePath)):
        prior_dataset = [prior_dataset]

    as_data = ASReviewData()
    # Find the URL of the datasets if the dataset is a benchmark dataset.
    for data in dataset:
        as_data.append(load_data(data))

    if new:
        as_data.labels = np.full((len(as_data), ), LABEL_NA, dtype=int)
    for data in included_dataset:
        as_data.append(load_data(data, data_type="included"))
    for data in excluded_dataset:
        as_data.append(load_data(data, data_type="excluded"))
    for data in prior_dataset:
        as_data.append(load_data(data, data_type="prior"))
    return as_data


def get_reviewer(dataset,
                 mode="simulate",
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
                 state_file=None,
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
    as_data = create_as_data(dataset,
                             included_dataset,
                             excluded_dataset,
                             prior_dataset,
                             new=new)

    if len(as_data) == 0:
        raise ValueError("Supply at least one dataset"
                         " with at least one record.")

    cli_settings = ASReviewSettings(model=model,
                                    n_instances=n_instances,
                                    n_queries=n_queries,
                                    n_papers=n_papers,
                                    n_prior_included=n_prior_included,
                                    n_prior_excluded=n_prior_excluded,
                                    query_strategy=query_strategy,
                                    balance_strategy=balance_strategy,
                                    feature_extraction=feature_extraction,
                                    mode=mode,
                                    data_fp=None)
    cli_settings.from_file(config_file)

    if state_file is not None:
        with open_state(state_file) as state:
            if state.is_empty():
                state.settings = cli_settings
            settings = state.settings
    else:
        settings = cli_settings

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

    # Check if mode is valid
    if mode in AVAILABLE_REVIEW_CLASSES:
        logging.info(f"Start review in '{mode}' mode.")
    else:
        raise ValueError(f"Unknown mode '{mode}'.")
    logging.debug(settings)

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
            "Not possible to provide both prior_idx and prior_record_id"
        )
    if prior_record_id is not None and len(prior_record_id) > 0:
        prior_idx = convert_id_to_idx(as_data, prior_record_id)

    # Initialize the review class.
    if mode == "simulate":
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
    elif mode == "minimal":
        reviewer = MinimalReview(as_data,
                                 model=train_model,
                                 query_model=query_model,
                                 balance_model=balance_model,
                                 feature_model=feature_model,
                                 n_papers=settings.n_papers,
                                 n_instances=settings.n_instances,
                                 n_queries=settings.n_queries,
                                 state_file=state_file,
                                 **kwargs)
    else:
        raise ValueError("Error finding mode, should never come here...")

    return reviewer


def review(*args,
           mode="simulate",
           model=DEFAULT_MODEL,
           save_model_fp=None,
           **kwargs):
    """Perform a review from arguments. Compatible with the CLI interface"""
    if mode not in AVAILABLE_CLI_MODI:
        raise ValueError(f"Unknown mode '{mode}'.")

    reviewer = get_reviewer(*args, mode=mode, model=model, **kwargs)

    # output the prior indices
    print("The following records are prior knowledge:\n")
    for prior_record_id in reviewer.start_idx:
        preview = preview_record(reviewer.as_data.record(prior_record_id))
        print(f"{prior_record_id} - {preview}")

    # Start the review process.
    reviewer.review()

    # If we're dealing with a keras model, we can save the last model weights.
    if save_model_fp is not None and model in KERAS_MODELS:
        save_model_h5_fp = splitext(save_model_fp)[0] + ".h5"
        json_model = model.model.to_json()
        with open(save_model_fp, "w") as f:
            json.dump(json_model, f, indent=2)
        model.model.save_weights(save_model_h5_fp, overwrite=True)


def review_simulate(dataset, *args, **kwargs):
    """CLI simulate mode."""

    print(ASCII_LOGO + ASCII_MSG_SIMULATE)

    # backwards comp
    if isinstance(dataset, list) and len(dataset) >= 1 and \
            dataset[0] in ["ptsd", "example_ptsd", "schoot"]:
        print(f"\n\nWarning '{dataset[0]}' will deprecate in the future,",
              "use 'benchmark:van_de_Schoot_2017' instead.\n\n")
        dataset = "benchmark:van_de_Schoot_2017"

    # backwards comp
    if isinstance(dataset, list) and len(dataset) >= 1 and \
            dataset[0] in ["ace", "example_cohen", "example_ace"]:
        print(f"\n\nWarning '{dataset[0]}' will deprecate in the future,",
              "use 'benchmark:Cohen_2006_ACEInhibitors' instead.\n\n")
        dataset = "benchmark:Cohen_2006_ACEInhibitors"

    # backwards comp
    if isinstance(dataset, list) and len(dataset) >= 1 and \
            dataset[0] in ["hall", "example_hall", "example_software"]:
        print(f"\n\nWarning '{dataset[0]}' will deprecate in the future,",
              "use 'benchmark:Hall_2012' instead.\n\n")
        dataset = "benchmark:Hall_2012"

    review(dataset, *args, mode='simulate', **kwargs)
