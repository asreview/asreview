import logging

from asreview.ascii import welcome_message
from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_FEATURE_EXTRACTION
from asreview.config import DEFAULT_MODEL
from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import DEFAULT_N_PRIOR_EXCLUDED
from asreview.config import DEFAULT_N_PRIOR_INCLUDED
from asreview.config import DEFAULT_QUERY_STRATEGY
from asreview.entry_points.base import BaseEntryPoint, _base_parser
from asreview.review import review_simulate


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

        print(welcome_message())
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
        help="File path to the dataset or one of the built-in datasets."
    )
    # Initial data (prior knowledge)
    parser.add_argument(
        "--n_prior_included",
        default=DEFAULT_N_PRIOR_INCLUDED,
        type=int,
        help="Sample n prior included papers. "
             "Only used when --prior_included is not given. "
             f"Default {DEFAULT_N_PRIOR_INCLUDED}")

    parser.add_argument(
        "--n_prior_excluded",
        default=DEFAULT_N_PRIOR_EXCLUDED,
        type=int,
        help="Sample n prior excluded papers. "
             "Only used when --prior_excluded is not given. "
             f"Default {DEFAULT_N_PRIOR_EXCLUDED}")

    parser.add_argument(
        "--prior_idx",
        default=[],
        nargs="*",
        type=int,
        help="Prior indices by rownumber (0 is first rownumber)."
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
        type=int,
        default=None,
        help="The number of queries. By default, the program "
             "stops after all documents are reviewed or is "
             "interrupted by the user."
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
        "--abstract_only",
        default=False,
        action='store_true',
        help="Simulate using the labels of abstract screening. "
             "This is option is useful if there is both a column for "
             "abstract and final screening available in the dataset. "
             "Default False."
    )
    parser.add_argument(
        "--verbose", "-v",
        default=0,
        type=int,
        help="Verbosity"
    )

    return parser
