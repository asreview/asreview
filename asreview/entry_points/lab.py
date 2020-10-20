import logging

from asreview.entry_points.base import BaseEntryPoint
from asreview.entry_points.base import _base_parser
from asreview.webapp.run_model import main as main_run_model


HOST_NAME = "localhost"
PORT_NUMBER = 5000


def _lab_parser(prog="lab"):
    parser = _base_parser(
        prog=prog,
        description="""ASReview LAB - Active learning for Systematic Reviews."""  # noqa
    )

    parser.add_argument(
        "--clean_project",
        default=None,
        type=str,
        help="Safe cleanup of temporary files in project.")

    parser.add_argument(
        "--clean_all_projects",
        action='store_true',
        help="Safe cleanup of temporary files in all projects.")

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


class WebRunModelEntryPoint(BaseEntryPoint):
    description = "Internal use only."

    def execute(self, argv):
        main_run_model(argv)
