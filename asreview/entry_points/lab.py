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
        "--clean-project",
        dest="clean_project",
        default=None,
        type=str,
        help="Safe cleanup of temporary files in project.")

    parser.add_argument(
        "--clean-all-projects",
        dest="clean_all_projects",
        default=None,
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

    parser.add_argument(
        "--no-browser",
        dest="no_browser",
        action='store_true',
        help="Do not open ASReview LAB in a browser after startup.")

    parser.add_argument(
        "--port-retries",
        dest="port_retries",
        default=50,
        type=int,
        help="The number of additional ports to try if the"
        "specified port is not available.")

    parser.add_argument(
        "--certfile",
        default="",
        type=str,
        help="The full path to an SSL/TLS certificate file.")

    parser.add_argument(
        "--keyfile",
        default="",
        type=str,
        help="The full path to a private key file for usage with SSL/TLS.")

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
