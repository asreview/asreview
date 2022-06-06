# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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
"""Simulation entry point and utils."""

import logging
import shutil
from pathlib import Path

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
from asreview.data import load_data
from asreview.entry_points.base import BaseEntryPoint
from asreview.entry_points.base import _base_parser
from asreview.models.balance.utils import get_balance_model
from asreview.models.classifiers import get_classifier
from asreview.models.feature_extraction import get_feature_model
from asreview.models.query import get_query_model
from asreview.project import ASReviewProject
from asreview.project import ProjectExistsError
from asreview.project import open_state
from asreview.review.simulate import ReviewSimulate
from asreview.settings import ASReviewSettings
from asreview.types import type_n_queries
from asreview.utils import get_random_state
from asreview.webapp.io import read_data

ASCII_MSG_SIMULATE = """
---------------------------------------------------------------------------------
|                                                                                |
|  Welcome to ASReview LAB - AI-assisted systematic reviews software.            |
|  In simulation mode the computer will simulate how well ASReview LAB           |
|  could have accelerate the systematic review of your dataset.                  |
|  You can sit back and relax while the computer runs this simulation.           |
|                                                                                |
|  GitHub page:        {0: <58}|
|  Questions/remarks:  {1: <58}|
|                                                                                |
---------------------------------------------------------------------------------
""".format(GITHUB_PAGE, EMAIL_ADDRESS)  # noqa


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


def _set_log_verbosity(verbose):
    if verbose == 0:
        logging.getLogger().setLevel(logging.WARNING)
    elif verbose == 1:
        logging.getLogger().setLevel(logging.INFO)
    elif verbose >= 2:
        logging.getLogger().setLevel(logging.DEBUG)


class SimulateEntryPoint(BaseEntryPoint):
    """Entry point for simulation with ASReview LAB."""

    description = "Simulate the performance of ASReview."

    def execute(self, argv):  # noqa

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

        # for webapp
        if args.dataset == "":

            project = ASReviewProject(args.state_file)

            with open_state(args.state_file) as state:
                settings = state.settings

                # Check if there are new labeled records.
                exist_new_labeled_records = state.exist_new_labeled_records

            # collect command line arguments and pass them to the reviewer
            if exist_new_labeled_records:
                as_data = read_data(project)
                prior_idx = args.prior_idx

            classifier_model = get_classifier(settings.model)
            query_model = get_query_model(settings.query_strategy)
            balance_model = get_balance_model(settings.balance_strategy)
            feature_model = get_feature_model(settings.feature_extraction)

        # for simulation CLI
        else:

            # do this check now and again when zipping.
            if Path(args.state_file).exists():
                raise ProjectExistsError("Project already exists.")

            as_data = load_data(args.dataset)

            if len(as_data) == 0:
                raise ValueError("Supply at least one dataset"
                                 " with at least one record.")

            # create a project file
            fp_tmp_simulation = Path(
                args.state_file).with_suffix(".asreview.tmp")

            project = ASReviewProject.create(
                fp_tmp_simulation,
                project_id=Path(args.state_file).stem,
                project_mode="simulate",
                project_name=Path(args.state_file).stem,
                project_description="Simulation created via ASReview via "
                                    "command line interface"
            )

            # Add the dataset to the project file.
            dataset_path = _get_dataset_path_from_args(args.dataset)

            as_data.to_file(
                Path(fp_tmp_simulation, 'data', dataset_path)
            )
            # Update the project.json.
            project.update_config(dataset_path=dataset_path)

            # create a new settings object from arguments
            settings = ASReviewSettings(
                model=args.model,
                n_instances=args.n_instances,
                stop_if=args.stop_if,
                n_prior_included=args.n_prior_included,
                n_prior_excluded=args.n_prior_excluded,
                query_strategy=args.query_strategy,
                balance_strategy=args.balance_strategy,
                feature_extraction=args.feature_extraction)
            settings.from_file(args.config_file)

            # Initialize models.
            random_state = get_random_state(args.seed)
            classifier_model = get_classifier(settings.model,
                                              random_state=random_state,
                                              **settings.model_param)
            query_model = get_query_model(settings.query_strategy,
                                          random_state=random_state,
                                          **settings.query_param)
            balance_model = get_balance_model(settings.balance_strategy,
                                              random_state=random_state,
                                              **settings.balance_param)
            feature_model = get_feature_model(settings.feature_extraction,
                                              random_state=random_state,
                                              **settings.feature_param)

            # prior knowledge
            if args.prior_idx is not None and args.prior_record_id is not None and \
                    len(args.prior_idx) > 0 and len(args.prior_record_id) > 0:
                raise ValueError(
                    "Not possible to provide both prior_idx and prior_record_id"
                )

            prior_idx = args.prior_idx
            if args.prior_record_id is not None and len(
                    args.prior_record_id) > 0:
                prior_idx = convert_id_to_idx(as_data, args.prior_record_id)

        if classifier_model.name.startswith("lstm-"):
            classifier_model.embedding_matrix = feature_model.\
                get_embedding_matrix(as_data.texts, args.embedding_fp)

        try:
            # Initialize the review class.
            reviewer = ReviewSimulate(
                as_data,
                project=project,
                model=classifier_model,
                query_model=query_model,
                balance_model=balance_model,
                feature_model=feature_model,
                n_papers=args.n_papers,
                n_instances=args.n_instances,
                stop_if=args.stop_if,
                prior_indices=prior_idx,
                n_prior_included=args.n_prior_included,
                n_prior_excluded=args.n_prior_excluded,
                init_seed=args.init_seed,
                write_interval=args.write_interval)

            # Start the review process.
            project.update_review(status="review")

            with open_state(project, read_only=True) as s:

                prior_df = s.get_priors()

                print("The following records are prior knowledge:\n")
                for i, row in prior_df.iterrows():
                    preview = as_data.record(row['record_id'])
                    print(preview)

            print("Simulation started")
            reviewer.review()
        except Exception as err:

            # save the error to the project
            project.set_error(err)

            raise err

        print("Simulation finished")
        project.mark_review_finished()

        # create .ASReview file out of simulation folder
        if args.dataset != "":

            project.export(args.state_file)
            shutil.rmtree(fp_tmp_simulation)


DESCRIPTION_SIMULATE = """
ASReview for simulation.

The simulation modus is used to measure the performance of the ASReview
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
        help="File path to the dataset or one of the benchmark datasets.")
    # Initial data (prior knowledge)
    parser.add_argument("--n_prior_included",
                        default=DEFAULT_N_PRIOR_INCLUDED,
                        type=int,
                        help="Sample n prior included papers. "
                        "Only used when --prior_idx is not given. "
                        f"Default {DEFAULT_N_PRIOR_INCLUDED}")

    parser.add_argument("--n_prior_excluded",
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
        help="Prior indices by rownumber (0 is first rownumber).")
    parser.add_argument("--prior_record_id",
                        default=[],
                        nargs="*",
                        type=int,
                        help="Prior indices by record_id.")
    # logging and verbosity
    parser.add_argument(
        "--state_file",
        "-s",
        default=None,
        type=str,
        help="Location to ASReview project file of simulation.")
    parser.add_argument("-m",
                        "--model",
                        type=str,
                        default=DEFAULT_MODEL,
                        help=f"The prediction model for Active Learning. "
                        f"Default: '{DEFAULT_MODEL}'.")
    parser.add_argument("-q",
                        "--query_strategy",
                        type=str,
                        default=DEFAULT_QUERY_STRATEGY,
                        help=f"The query strategy for Active Learning. "
                        f"Default: '{DEFAULT_QUERY_STRATEGY}'.")
    parser.add_argument(
        "-b",
        "--balance_strategy",
        type=str,
        default=DEFAULT_BALANCE_STRATEGY,
        help="Data rebalancing strategy mainly for RNN methods. Helps against"
        " imbalanced dataset with few inclusions and many exclusions. "
        f"Default: '{DEFAULT_BALANCE_STRATEGY}'")
    parser.add_argument(
        "-e",
        "--feature_extraction",
        type=str,
        default=DEFAULT_FEATURE_EXTRACTION,
        help="Feature extraction method. Some combinations of feature"
        " extraction method and prediction model are impossible/ill"
        " advised."
        f"Default: '{DEFAULT_FEATURE_EXTRACTION}'")
    parser.add_argument(
        '--init_seed',
        default=None,
        type=int,
        help="Seed for setting the prior indices if the --prior_idx option is "
        "not used. If the option --prior_idx is used with one or more "
        "index, this option is ignored.")
    parser.add_argument("--n_instances",
                        default=DEFAULT_N_INSTANCES,
                        type=int,
                        help="Number of papers queried each query."
                        f"Default {DEFAULT_N_INSTANCES}.")
    parser.add_argument(
        "--n_queries",
        type=type_n_queries,
        default="min",
        help="Deprecated, use 'stop_if' instead.")
    parser.add_argument(
        "--stop_if",
        type=type_n_queries,
        default="min",
        help="The number of label actions to simulate. Default, 'min' "
        "will stop simulating when all relevant records are found. Use -1 "
        "to simulate all labels actions.")
    parser.add_argument(
        "-n",
        "--n_papers",
        type=int,
        default=None,
        help="Deprecated, use 'stop_if' instead.")
    parser.add_argument("--verbose",
                        "-v",
                        default=0,
                        type=int,
                        help="Verbosity")
    parser.add_argument(
        "--write_interval",
        "-w",
        default=None,
        type=int,
        help="The simulation data will be written away after each set of this"
        "many labeled records. By default only writes away data at the end"
        "of the simulation to make it as fast as possible.")

    return parser
