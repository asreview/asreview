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

import logging

from asreview.batch import batch_simulate
from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_FEATURE_EXTRACTION
from asreview.config import DEFAULT_MODEL
from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import DEFAULT_N_PRIOR_EXCLUDED
from asreview.config import DEFAULT_N_PRIOR_INCLUDED
from asreview.config import DEFAULT_QUERY_STRATEGY
from asreview.entry_points.base import BaseEntryPoint, _base_parser
from asreview.review import review_simulate
from asreview.types import type_n_queries


class SimulateEntryPoint(BaseEntryPoint):
    description = "Simulate the performance of ASReview."

    def execute(self, argv):
        parser = _simulate_parser()
        args = parser.parse_args(argv)

        args_dict = vars(args)
        path = args_dict.pop("dataset")

        verbose = args_dict.get("verbose", 0)
        if verbose == 0:
            logging.getLogger().setLevel(logging.WARNING)
        elif verbose == 1:
            logging.getLogger().setLevel(logging.INFO)
        elif verbose >= 2:
            logging.getLogger().setLevel(logging.DEBUG)

        review_simulate(path, **args_dict)


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
        nargs="*",
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
    parser.add_argument(
        "--included_dataset",
        default=[],
        nargs="*",
        type=str,
        help="A dataset with papers that should be included"
             "Can be used multiple times."
    )
    parser.add_argument(
        "--excluded_dataset",
        default=[],
        nargs="*",
        type=str,
        help="A dataset with papers that should be excluded"
             "Can be used multiple times."
    )
    parser.add_argument(
        "--prior_dataset",
        default=[],
        nargs="*",
        type=str,
        help="A dataset with papers from prior studies."
    )
    # logging and verbosity
    parser.add_argument(
        "--state_file", "-s", "--log_file", "-l",
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

    return parser


class BatchEntryPoint(BaseEntryPoint):
    description = "Parallel simulation for ASReview."

    def execute(self, argv):
        parser = _batch_parser()
        kwargs = vars(parser.parse_args(argv))
        batch_simulate(**kwargs)


DESCRIPTION_BATCH = """
Automated Systematic Review (ASReview) batch system for simulation runs.

It has the same interface as the simulation modus, but adds an extra option
(--n_runs) to run a batch of simulation runs with the same configuration.
"""


def _batch_parser():
    parser = _simulate_parser(
        prog="simulate-batch",
        description=DESCRIPTION_BATCH
    )
    parser.add_argument(
        "-r", "--n_run",
        default=10,
        type=int,
        help="Number of runs to perform."
    )
    return parser
