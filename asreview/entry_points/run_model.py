from asreview.entry_points.base import BaseEntryPoint
from asreview.webapp.run_model import main


class WebRunModelEntryPoint(BaseEntryPoint):
    description = "Internal use only."

    def execute(self, argv):
        main(argv)
