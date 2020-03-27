from asreview.entry_points.base import BaseEntryPoint
from asreview.entry_points.base import _base_parser


DESCRIPTION_ORACLE = """
ASReview App - Interactive machine learning for systematic reviews.
"""


class GUIEntryPoint(BaseEntryPoint):
    description = "Graphical user interface for ASReview."

    def execute(self, argv):

        from asreview.webapp.start_flask import main

        main(argv)


def _oracle_parser(prog="oracle", description=DESCRIPTION_ORACLE):
    parser = _base_parser(prog=prog, description=description)
    # Active learning parameters

    parser.add_argument(
        "--ip",
        default="localhost",
        type=str,
        help="The IP address the server will listen on.")

    parser.add_argument(
        "--port",
        default=8888,
        type=int,
        help="The port the server will listen on")

    return parser
