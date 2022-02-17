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
from datetime import datetime
from pathlib import Path
from pathlib import PurePath

import numpy as np

from asreview.compat import convert_id_to_idx
from asreview.config import ASCII_LOGO
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
from asreview.config import LABEL_NA
from asreview.data import ASReviewData
from asreview.data import load_data
from asreview.entry_points.base import BaseEntryPoint
from asreview.entry_points.base import _base_parser
from asreview.io.paper_record import preview_record
from asreview.models.balance.utils import get_balance_model
from asreview.models.classifiers import get_classifier
from asreview.models.feature_extraction import get_feature_model
from asreview.models.query import get_query_model
from asreview.review.simulate import ReviewSimulate
from asreview.settings import ASReviewSettings
from asreview.state.paths import get_data_path
from asreview.state.paths import get_data_file_path
from asreview.state.paths import get_feature_matrix_path
from asreview.state.paths import get_project_file_path
from asreview.state.utils import init_project_folder_structure
from asreview.state.errors import StateNotFoundError
from asreview.state import open_state
from asreview.types import type_n_queries
from asreview.utils import get_random_state

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


def mark_review_finished(project_path, review_id=None):
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


def _is_review_finished(project_path, review_id=None):
    """Check if the given review is finished."""
    project_path = Path(project_path)
    with open(get_project_file_path(project_path), 'r') as f:
        project_config = json.load(f)

    if review_id is None:
        review_index = 0
    else:
        review_index = [x['id']
                        for x in project_config['reviews']].index(review_id)

    review_info = project_config['reviews'][review_index]

    return ('review_finished' in review_info.keys()) & \
        review_info['review_finished']


def _get_dataset_path_from_args(args_dataset):
    """Remove 'benchmark:' from the dataset name and add .csv suffix.

    Parameters
    ----------
    args_dataset : str
        Name of the dataset.

    Returns
    -------
    str
        Dataset name without 'benchmark:' if it started with that,
        and with .csv suffix.
    """
    if args_dataset.startswith('benchmark:'):
        args_dataset = args_dataset[10:]

    return Path(args_dataset).with_suffix('.csv').name


def _is_partial_simulation(args):
    """Check if there already is a project file with data of the simulation
    with given args.

    Arguments
    ----------
    args : output of argparse

    Returns
    -------
    bool
        Returns True if there is a project file at args.state_file, with
        the given dataset, and a review with the given settings, which is not
        marked as finished.
    """
    try:
        with open_state(args.state_file) as state:
            settings = state.settings
    except StateNotFoundError:
        return False

    # Check if the datasets have the same name.
    try:
        project_data_file_name = get_data_file_path(args.state_file).name
    except Exception:
        return False
    args_data_file_name = _get_dataset_path_from_args(args.dataset)
    if project_data_file_name != args_data_file_name:
        return False

    # Check if the feature matrix is available.
    feature_extraction_method = settings.feature_extraction
    try:
        feature_matrix_file = get_feature_matrix_path(args.state_file)
    except FileNotFoundError:
        return False
    if not feature_matrix_file.name.startswith(feature_extraction_method):
        return False

    return True


def _set_log_verbosity(verbose):
    if verbose == 0:
        logging.getLogger().setLevel(logging.WARNING)
    elif verbose == 1:
        logging.getLogger().setLevel(logging.INFO)
    elif verbose >= 2:
        logging.getLogger().setLevel(logging.DEBUG)


class SimulateEntryPoint(BaseEntryPoint):
    description = "Simulate the performance of ASReview."

    def execute(self, argv):

        # parse arguments
        parser = _simulate_parser()
        args = parser.parse_args(argv)

        # change the verbosity
        _set_log_verbosity(args.verbose)

        # check for state file extension
        if args.state_file is None:
            raise ValueError(
                "Specify project file name (with .asreview extension).")

        # print intro message
        print(ASCII_LOGO + ASCII_MSG_SIMULATE)

        # read dataset into memory
        as_data = load_data(args.dataset)

        if len(as_data) == 0:
            raise ValueError("Supply at least one dataset"
                             " with at least one record.")

        if not _is_partial_simulation(args):
            # TODO: refactor these functions into a project module
            init_project_folder_structure(args.state_file,
                                          project_mode='simulate')

            # Add the dataset to the project file.
            dataset_path = _get_dataset_path_from_args(args.dataset)

            as_data.to_csv(
                Path(
                    get_data_path(args.state_file),
                    dataset_path
                )
            )
            # Update the project.json.
            project_file_path = get_project_file_path(args.state_file)
            with open(project_file_path, 'r') as f:
                project_json = json.load(f)

            project_json['dataset_path'] = dataset_path

            with open(project_file_path, 'w') as f:
                json.dump(project_json, f)

        # create a new settings object from arguments
        settings = ASReviewSettings(
            model=args.model,
            n_instances=args.n_instances,
            n_queries=args.n_queries,
            n_papers=args.n_papers,
            n_prior_included=args.n_prior_included,
            n_prior_excluded=args.n_prior_excluded,
            query_strategy=args.query_strategy,
            balance_strategy=args.balance_strategy,
            feature_extraction=args.feature_extraction,
            mode="simulate",
            data_fp=None)
        settings.from_file(args.config_file)

        # Initialize models.
        random_state = get_random_state(args.seed)
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

        # TODO{Deprecate and integrate with the model}
        # LSTM models need embedding matrices.
        if train_model.name.startswith("lstm-"):
            texts = as_data.texts
            train_model.embedding_matrix = feature_model.\
                get_embedding_matrix(texts, args.embedding_fp)

        # prior knowledge
        if args.prior_idx is not None and args.prior_record_id is not None and \
                len(args.prior_idx) > 0 and len(args.prior_record_id) > 0:
            raise ValueError(
                "Not possible to provide both prior_idx and prior_record_id")

        prior_idx = args.prior_idx
        if args.prior_record_id is not None and len(args.prior_record_id) > 0:
            prior_idx = convert_id_to_idx(as_data, args.prior_record_id)

        print("The following records are prior knowledge:\n")
        for prior_record_id in prior_idx:
            preview = preview_record(as_data.record(prior_record_id))
            print(f"{prior_record_id} - {preview}")

        # Initialize the review class.
        reviewer = ReviewSimulate(as_data,
                                  state_file=args.state_file,
                                  model=train_model,
                                  query_model=query_model,
                                  balance_model=balance_model,
                                  feature_model=feature_model,
                                  n_papers=args.n_papers,
                                  n_instances=args.n_instances,
                                  n_queries=args.n_queries,
                                  prior_indices=prior_idx,
                                  n_prior_included=args.n_prior_included,
                                  n_prior_excluded=args.n_prior_excluded,
                                  init_seed=args.init_seed,
                                  write_interval=args.write_interval)

        # Start the review process.
        reviewer.review()

        # Mark review as finished.
        mark_review_finished(args.state_file)


DESCRIPTION_SIMULATE = """
ASReview for simulation.

The simulation modus is used to measure the performance of our
software on existing systematic reviews. The software shows how many
papers you could have potentially skipped during the systematic
review."""


def _simulate_parser(prog="simulate", description=DESCRIPTION_SIMULATE):
    parser = _base_parser(prog=prog, description=description)
    # Active learning parameters
    # File path to the data.
    parser.add_argument(
        "dataset",
        type=str,
        help="File path to the dataset or one of the benchmark datasets."
    )
    # Initial data (prior knowledge)
    parser.add_argument(
        "--n_prior_included",
        default=DEFAULT_N_PRIOR_INCLUDED,
        type=int,
        help="Sample n prior included papers. "
             "Only used when --prior_idx is not given. "
             f"Default {DEFAULT_N_PRIOR_INCLUDED}")

    parser.add_argument(
        "--n_prior_excluded",
        default=DEFAULT_N_PRIOR_EXCLUDED,
        type=int,
        help="Sample n prior excluded papers. "
             "Only used when --prior_idx is not given. "
             f"Default {DEFAULT_N_PRIOR_EXCLUDED}")

    parser.add_argument(
        "--prior_idx",
        default=[],
        nargs="*",
        type=int,
        help="Prior indices by rownumber (0 is first rownumber)."
    )
    parser.add_argument(
        "--prior_record_id",
        default=[],
        nargs="*",
        type=int,
        help="Prior indices by record_id."
    )
    # logging and verbosity
    parser.add_argument(
        "--state_file", "-s",
        default=None,
        type=str,
        help="Location to store the state of the simulation."
    )
    parser.add_argument(
        "-m", "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"The prediction model for Active Learning. "
             f"Default: '{DEFAULT_MODEL}'.")
    parser.add_argument(
        "-q", "--query_strategy",
        type=str,
        default=DEFAULT_QUERY_STRATEGY,
        help=f"The query strategy for Active Learning. "
             f"Default: '{DEFAULT_QUERY_STRATEGY}'.")
    parser.add_argument(
        "-b", "--balance_strategy",
        type=str,
        default=DEFAULT_BALANCE_STRATEGY,
        help="Data rebalancing strategy mainly for RNN methods. Helps against"
             " imbalanced dataset with few inclusions and many exclusions. "
             f"Default: '{DEFAULT_BALANCE_STRATEGY}'")
    parser.add_argument(
        "-e", "--feature_extraction",
        type=str,
        default=DEFAULT_FEATURE_EXTRACTION,
        help="Feature extraction method. Some combinations of feature"
             " extraction method and prediction model are impossible/ill"
             " advised."
             f"Default: '{DEFAULT_FEATURE_EXTRACTION}'"
    )
    parser.add_argument(
        '--init_seed',
        default=None,
        type=int,
        help="Seed for setting the prior indices if the --prior_idx option is "
             "not used. If the option --prior_idx is used with one or more "
             "index, this option is ignored."
    )
    parser.add_argument(
        "--n_instances",
        default=DEFAULT_N_INSTANCES,
        type=int,
        help="Number of papers queried each query."
             f"Default {DEFAULT_N_INSTANCES}.")
    parser.add_argument(
        "--n_queries",
        type=type_n_queries,
        default=None,
        help="The number of queries. Alternatively, entering 'min' will stop the "
             "simulation when all relevant records have been found. By default, "
             "the program stops after all records are reviewed or is interrupted "
             "by the user."
    )
    parser.add_argument(
        "-n", "--n_papers",
        type=int,
        default=None,
        help="The number of papers to be reviewed. By default, "
             "the program stops after all documents are reviewed or is "
             "interrupted by the user."
    )
    parser.add_argument(
        "--verbose", "-v",
        default=0,
        type=int,
        help="Verbosity"
    )
    parser.add_argument(
        "--write_interval", "-w",
        default=None,
        type=int,
        help="The simulation data will be written away after each set of this"
             "many labeled records. By default only writes away data at the end"
             "of the simulation to make it as fast as possible."
    )

    return parser
