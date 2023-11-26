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
import time
import webbrowser
from threading import Timer

import requests
from gevent.pywsgi import WSGIServer

from asreview import __version__
from asreview._deprecated import DeprecateAction
from asreview._deprecated import mark_deprecated_help_strings
from asreview.project import ASReviewProject
from asreview.project import get_project_path
from asreview.project import get_projects
from asreview.webapp.app import create_app

# Host name
HOST_NAME = os.getenv("ASREVIEW_HOST")
if HOST_NAME is None:
    HOST_NAME = "localhost"

PORT_NUMBER = 5000


def _deprecated_dev_mode():
    if os.environ.get("FLASK_DEBUG", "") == "1":
        print(
            "\n\n\n!IMPORTANT!\n\n"
            "asreview lab development mode is deprecated, see:\n"
            "https://github.com/J535D165/asreview/blob/master/DEVELOPMENT.md"
            "\n\n\n"
        )
        exit(1)


def _check_port_in_use(host, port):
    logging.info(f"Checking if host and port are available :: {host}:{port}")
    host = host.replace("https://", "").replace("http://", "")
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0


def _open_browser(start_url):
    Timer(1, lambda: webbrowser.open_new(start_url)).start()

    print("\n\n\n\nIf your browser doesn't open. " f"Navigate to {start_url}\n\n\n\n")


def _check_for_update():
    """Check if there is an update available."""

    try:
        r = requests.get("https://pypi.org/pypi/asreview/json")
        r.raise_for_status()
        latest_version = r.json()["info"]["version"]
        if latest_version != __version__ and "+" not in __version__:
            print(
                "\n\n\n"
                f"ASReview LAB version {latest_version} is available. "
                "Please update using:\n"
                "pip install --upgrade asreview"
                "\n\n\n"
            )

            time.sleep(5)
    except Exception:
        print("Could not check for updates.")


def lab_entry_point(argv):
    # check deprecated dev mode
    _deprecated_dev_mode()

    parser = _lab_parser()
    mark_deprecated_help_strings(parser)
    args = parser.parse_args(argv)

    # check for update
    if not args.skip_update_check:
        _check_for_update()

    app = create_app(
        env="production",
        config_file=args.flask_config_file,
        secret_key=args.secret_key,
        salt=args.salt,
        enable_authentication=args.enable_authentication,
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
    start_url = f"{protocol}{args.host}:{port}/"

    ssl_args = {}
    if args.keyfile and args.certfile:
        ssl_args = {"keyfile": args.keyfile, "certfile": args.certfile}

    server = WSGIServer((args.host, port), app, **ssl_args)
    print(f"Serving ASReview LAB at {start_url}")

    if not args.no_browser:
        _open_browser(start_url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\nShutting down server\n\n")


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
        dest="flask_config_file",
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
        "--skip-update-check",
        dest="skip_update_check",
        action="store_true",
        help="Skip checking for updates.",
    )

    return parser
