import logging

from asreview.entry_points.base import BaseEntryPoint
from asreview.entry_points.base import _base_parser


DESCRIPTION_LAB = """
ASReview LAB - Active learning for Systematic Reviews.
"""

HOST_NAME = "localhost"
PORT_NUMBER = 5000


class LABEntryPoint(BaseEntryPoint):
    description = "Graphical user interface for ASReview."

    def execute(self, argv):

        from asreview.webapp.start_flask import main

        main(argv)


# deprecated oracle class
class OracleEntryPoint(LABEntryPoint):
    description = "Graphical user interface for ASReview. (Deprecated)"

    def execute(self, argv):

        logging.warning("Warning: subcommmand 'oracle' is replaced by 'lab'.")

        super(OracleEntryPoint, self).execute(argv)


def _lab_parser(prog="lab", description=DESCRIPTION_LAB):
    parser = _base_parser(prog=prog, description=description)
    # Active learning parameters

    parser.add_argument(
        "--ip",
        default=HOST_NAME,
        type=str,
        help="The IP address the server will listen on.")

    parser.add_argument(
        "--port",
        default=PORT_NUMBER,
        type=int,
        help="The port the server will listen on.")

    return parser
