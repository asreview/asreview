import logging

from asreview.ascii import welcome_message

from asreview.entry_points.oracle import _oracle_parser
from asreview.config import DEFAULT_N_PRIOR_EXCLUDED
from asreview.config import DEFAULT_N_PRIOR_INCLUDED
from asreview.entry_points.base import BaseEntryPoint
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

        print(welcome_message("simulate"))
        review_simulate(path, **args_dict)


DESCRIPTION_SIMULATE = """
Automated Systematic Review (ASReview) for simulation runs.

The simulation modus is used to measure the performance of our
software on existing systematic reviews. The software shows how many
papers you could have potentially skipped during the systematic
review."""


def _simulate_parser():
    parser = _oracle_parser(prog="simulate", description=DESCRIPTION_SIMULATE)
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
    return parser
