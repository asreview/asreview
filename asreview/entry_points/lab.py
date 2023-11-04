# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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
import argparse
import logging
import os
import socket
import webbrowser
from threading import Timer

from gevent.pywsgi import WSGIServer

from asreview._deprecated import DeprecateAction
from asreview._deprecated import mark_deprecated_help_strings
from asreview.entry_points.base import BaseEntryPoint
from asreview.project import ASReviewProject
from asreview.project import get_project_path
from asreview.project import get_projects
from asreview.webapp.run_model import main as main_run_model
from asreview.webapp.start_flask import create_app

# Host name
HOST_NAME = os.getenv("ASREVIEW_HOST")
if HOST_NAME is None:
    HOST_NAME = "localhost"
# Default Port number
PORT_NUMBER = 5000


def _url(host, port, protocol):
    """Create url from host and port."""
    return f"{protocol}{host}:{port}/"


def _deprecated_dev_mode():
    if os.environ.get("FLASK_DEBUG", "") == "1":
        print(
            "\n\n\n!IMPORTANT!\n\n"
            "asreview lab development mode is deprecated, use:\n"
            "flask --app asreview/webapp/start_flask.py run --debug"
            "\n\n\n"
        )
        exit(1)


def _check_port_in_use(host, port):
    """Check if port is already in use.

    Arguments
    ---------
    host: str
        The current host.
    port: int
        The host port to be checked.

    Returns
    -------
    bool:
        True if port is in use, false otherwise.
    """
    logging.info(f"Checking if host and port are available :: {host}:{port}")
    host = host.replace("https://", "").replace("http://", "")
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0


def _open_browser(host, port, protocol, no_browser):
    """Open ASReview in browser if flag is set.

    Otherwise, it displays an alert to copy and paste the url
    at which ASReview is currently served.
    """
    if no_browser:
        print(
            "\nTo access ASReview LAB, copy and paste "
            "this url in a browser "
            f"{_url(host, port, protocol)}\n"
        )
        return

    start_url = _url(host, port, protocol)
    Timer(1, lambda: webbrowser.open_new(start_url)).start()
    print(
        f"Start browser at {start_url}"
        "\n\n\n\nIf your browser doesn't open. "
        f"Please navigate to '{start_url}'\n\n\n\n"
    )


class LABEntryPoint(BaseEntryPoint):
    """Entry point to start the ASReview LAB webapp."""

    def execute(self, argv):
        # check deprecated dev mode
        _deprecated_dev_mode()

        parser = _lab_parser()
        mark_deprecated_help_strings(parser)
        args = parser.parse_args(argv)

        app = create_app(
            env = "production",
            config_file=args.flask_configfile,
            secret_key=args.secret_key,
            salt = args.salt,
            enable_authentication = args.enable_authentication,
        )
        app.config["PROPAGATE_EXCEPTIONS"] = False

        # clean all projects
        # TODO@{Casper}: this needs a little bit
        # of work, we need to access all sub-folders
        if args.clean_all_projects:
            print("Cleaning all project files.")
            for project in get_projects():
                project.clean_tmp_files()
            print("Done")
            return

        # clean project by project_id
        # TODO@{Casper}: cleaning without a user context
        # is meaningless -> I think we should remove this
        # option
        if args.clean_project is not None:
            print(f"Cleaning project file '{args.clean_project}'.")
            ASReviewProject(get_project_path(args.clean_project)).clean_tmp_files()
            print("Done")
            return

        # if port is already taken find another one
        port = args.port
        original_port = port
        while _check_port_in_use(args.host, port) is True:
            old_port = port
            port = int(port) + 1
            if port - original_port >= args.port_retries:
                raise ConnectionError(
                    "Could not find an available port \n"
                    "to launch ASReview LAB. Last port \n"
                    f"was {str(port)}"
                )
            print(f"Port {old_port} is in use.\n* Trying to start at {port}")

        protocol = "https://" if args.certfile and args.keyfile else "http://"
        ssl_args = {}
        if args.keyfile and args.certfile:
            ssl_args = {"keyfile": args.keyfile, "certfile":args.certfile}

        server = WSGIServer((args.host, port), app, **ssl_args)
        _open_browser(args.host, port, protocol, args.no_browser)

        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\n\nShutting down server\n\n")


class WebRunModelEntryPoint(BaseEntryPoint):
    description = "Internal use only."

    def execute(self, argv):
        main_run_model(argv)


def _lab_parser():
    # parse arguments if available
    parser = argparse.ArgumentParser(
        prog="lab",
        description="""ASReview LAB - Active learning for Systematic Reviews.""",  # noqa
        formatter_class=argparse.RawTextHelpFormatter,
    )

    parser.add_argument(
        "--clean-project",
        dest="clean_project",
        default=None,
        type=str,
        help="Safe cleanup of temporary files in project.",
    )

    parser.add_argument(
        "--clean-all-projects",
        dest="clean_all_projects",
        default=None,
        action="store_true",
        help="Safe cleanup of temporary files in all projects.",
    )

    parser.add_argument(
        "--ip",
        default=HOST_NAME,
        type=str,
        action=DeprecateAction,
        help="The IP address the server will listen on. Use the --host argument.",
    )

    parser.add_argument(
        "--host",
        default=HOST_NAME,
        type=str,
        help="The IP address the server will listen on.",
    )

    parser.add_argument(
        "--port",
        default=PORT_NUMBER,
        type=int,
        help="The port the server will listen on.",
    )

    parser.add_argument(
        "--enable-auth",
        dest="enable_authentication",
        action="store_true",
        help="Enable authentication.",
    )

    parser.add_argument(
        "--secret-key",
        default=None,
        type=str,
        help="Secret key for authentication.",
    )

    parser.add_argument(
        "--salt",
        default=None,
        type=str,
        help="When using authentication, a salt code is needed for hasing passwords.",
    )

    parser.add_argument(
        "--flask-configfile",
        default="",
        type=str,
        help="Full path to a TOML file containing Flask parameters"
        "for authentication.",
    )

    parser.add_argument(
        "--no-browser",
        dest="no_browser",
        action="store_true",
        help="Do not open ASReview LAB in a browser after startup.",
    )

    parser.add_argument(
        "--port-retries",
        dest="port_retries",
        default=50,
        type=int,
        help="The number of additional ports to try if the"
        "specified port is not available.",
    )

    parser.add_argument(
        "--certfile",
        default="",
        type=str,
        help="The full path to an SSL/TLS certificate file.",
    )

    parser.add_argument(
        "--keyfile",
        default="",
        type=str,
        help="The full path to a private key file for usage with SSL/TLS.",
    )

    parser.add_argument(
        "--config_file",
        type=str,
        default=None,
        help="Deprecated, see subcommand simulate.",
        action=DeprecateAction,
    )

    parser.add_argument(
        "--seed",
        default=None,
        type=int,
        help="Deprecated, see subcommand simulate.",
        action=DeprecateAction,
    )

    parser.add_argument(
        "--embedding",
        type=str,
        default=None,
        dest="embedding_fp",
        help="File path of embedding matrix. Required for LSTM models.",
    )
    return parser
