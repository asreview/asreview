from asreview.batch import batch_simulate
from asreview.entry_points.base import BaseEntryPoint
from asreview.entry_points.simulate import _simulate_parser


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
    parser = _simulate_parser(prog="batch", description=DESCRIPTION_BATCH)
    parser.add_argument(
        "-r", "--n_run",
        default=10,
        type=int,
        help="Number of runs to perform."
    )
    return parser
