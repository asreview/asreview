from asreview.entry_points.base import BaseEntryPoint
from asreview.webapp.start_flask import main


class GUIEntryPoint(BaseEntryPoint):
    description = "Graphical user interface for ASReview."

    def execute(self, argv):
        main(argv)
