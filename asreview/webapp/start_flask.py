import logging
import os
import webbrowser
from threading import Timer

from flask import Flask
from flask import send_from_directory
from flask.json import jsonify
from flask.templating import render_template
from flask_cors import CORS
from werkzeug.exceptions import InternalServerError

from asreview import __version__ as asreview_version
from asreview.entry_points.lab import _lab_parser
from asreview.webapp import api
from asreview.webapp.utils.project import clean_project_tmp_files
from asreview.webapp.utils.project import clean_all_project_tmp_files

# set logging level
if os.environ.get('FLASK_ENV', "") == "development":
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)


def _url(host, port):
    return "http://{host}:{port}/".format(host=host, port=port)


def _open_browser(host, port):
    webbrowser.open_new(_url(host, port))


def create_app(**kwargs):

    app = Flask(
        __name__,
        instance_relative_config=True,
        static_folder="build/static",
        template_folder="build"
    )

    # Get the ASReview arguments.
    kwargs.pop("dataset", None)
    app.config['asr_kwargs'] = kwargs

    # Ensure the instance folder exists.
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    CORS(app, resources={r"*": {"origins": "*"}})

    app.register_blueprint(api.bp)

    @app.errorhandler(InternalServerError)
    def error_500(e):
        original = getattr(e, "original_exception", None)

        if original is None:
            # direct 500 error, such as abort(500)
            logging.error(e)
            return jsonify(message="Whoops, something went wrong."), 500

        # wrapped unhandled error
        logging.error(e.original_exception)
        return jsonify(message=str(e.original_exception)), 500

    @app.route('/', methods=['GET'])
    def index():

        return render_template("index.html")

    @app.route('/favicon.ico')
    def send_favicon():
        return send_from_directory(
            'build',
            'favicon.ico',
            mimetype='image/vnd.microsoft.icon'
        )

    @app.route('/boot', methods=["GET"])
    def api_boot():
        """Get the boot info"""

        if os.environ.get("FLASK_ENV", None) == "development":
            status = "development"
        else:
            status = "asreview"

            try:
                import asreviewcontrib.covid19  # noqa
                status = "asreview-covid19"
            except ImportError:
                logging.debug("covid19 plugin not found")

        # get the asreview version

        response = jsonify({
            "status": status,
            "version": asreview_version,
        })
        response.headers.add('Access-Control-Allow-Origin', '*')

        return response

    return app


def main(argv):

    parser = _lab_parser(prog="lab")
    args = parser.parse_args(argv)

    # clean all projects
    if args.clean_all_projects:
        clean_all_project_tmp_files()
        return

    # clean project by project_id
    if args.clean_project is not None:
        clean_project_tmp_files(args.clean_project)
        return

    # shortcuts for host and port
    host = args.ip
    port = args.port

    def _internal_open_webbrowser():
        _open_browser(host, port)

    # open webbrowser if not in flask development mode
    if os.environ.get('FLASK_ENV', "") != "development":
        Timer(1, _internal_open_webbrowser).start()

    print(
        "\n\n\n\nIf your browser doesn't open. "
        "Please navigate to '{url}'\n\n\n\n".format(url=_url(host, port)))

    app = create_app(
        embedding_fp=args.embedding_fp,
        config_file=args.config_file,
        seed=args.seed
    )
    app.config['PROPAGATE_EXCEPTIONS'] = False
    app.run(host=host, port=port)
