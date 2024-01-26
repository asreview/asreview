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

import requests
from gevent.pywsgi import WSGIServer

import asreview as asr
from asreview._deprecated import DeprecateAction
from asreview._deprecated import mark_deprecated_help_strings
from asreview.project import get_project_path
from asreview.project import get_projects
from asreview.webapp.app import create_app

# Host name
HOST_NAME = os.getenv("ASREVIEW_HOST")
if HOST_NAME is None:
    HOST_NAME = "localhost"

PORT_NUMBER = 5000


def _check_port_in_use(host, port):
    logging.info(f"Checking if host and port are available :: {host}:{port}")
    host = host.replace("https://", "").replace("http://", "")
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0


def _open_browser(start_url):
    Timer(1, lambda: webbrowser.open_new(start_url)).start()


def _check_for_update():
    """Check if there is an update available."""

    try:
        r = requests.get("https://pypi.org/pypi/asreview/json")
        r.raise_for_status()
        latest_version = r.json()["info"]["version"]
        if latest_version != asr.__version__ and "+" not in asr.__version__:
            return True, latest_version

        return False, latest_version
    except Exception:
        pass


def lab_entry_point(argv):
    parser = _lab_parser()
    mark_deprecated_help_strings(parser)
    args = parser.parse_args(argv)

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
        asr.Project(get_project_path(args.clean_project)).clean_tmp_files()
        print("Done")
        return

    # if port is already taken find another one
    port = args.port
    original_port = port
    while _check_port_in_use(args.host, port) is True:
        port = int(port) + 1
        if port - original_port >= args.port_retries:
            raise ConnectionError(
                "Could not find an available port \n"
                "to launch ASReview LAB. Last port \n"
                f"was {str(port)}"
            )

    protocol = "https://" if args.certfile and args.keyfile else "http://"
    start_url = f"{protocol}{args.host}:{port}/"

    ssl_args = {}
    if args.keyfile and args.certfile:
        ssl_args = {"keyfile": args.keyfile, "certfile": args.certfile}

    server = WSGIServer((args.host, port), app, **ssl_args)

    print("\n\nASReview LAB is starting up \u001b[31m<3\u001b[0m\n\n")
    print("\033[1mInformation about your application\033[0m\n")

    host_str = f"\033[1mURL:\033[0m {start_url}"
    if original_port != port:
        host_str += (
            f" \u001b[48;5;11m[Port {original_port} was already in use]\u001b[0m"
        )

    version_str = f"\033[1mVersion:\033[0m {asr.__version__}"
    update_available = False
    if not args.skip_update_check:
        update_available, latest_version = _check_for_update()
        if update_available:
            version_str += (
                " \u001b[48;5;202m[Update available"
                f": {asr.__version__} -> {latest_version}]\u001b[0m"
            )

    print(host_str)
    print(version_str)
    print(f"\033[1mLocal projects folder:\033[0m {asr.asreview_path()}")

    if update_available:
        print(
            "\n\n\033[1mUpdate for ASReview LAB is available!\033[0m\n"
            "Run `pip install --upgrade asreview` to update."
        )

    print(
        "\n\nMake regular backups of the ASReview"
        " projects folder to prevent data loss."
    )
    if not args.no_browser:
        _open_browser(start_url)
        print(f"If your browser doesn't open, navigate to {start_url}.\n\n\n")

    print("Press Ctrl+C to exit.\n\n")

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
