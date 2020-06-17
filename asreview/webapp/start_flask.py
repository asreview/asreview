import os
import webbrowser
from threading import Timer

from flask import Flask
from flask import send_from_directory
from flask.templating import render_template
from flask_cors import CORS

from asreview.entry_points.gui import _oracle_parser
from asreview.webapp import api


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

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(api.bp)

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

    return app


def main(argv):

    parser = _oracle_parser(prog="oracle")
    kwargs = vars(parser.parse_args(argv))

    host = kwargs.pop("ip")
    port = kwargs.pop("port")

    def _internal_open_webbrowser():
        _open_browser(host, port)

    # open webbrowser if not in flask development mode
    if os.environ.get('FLASK_ENV', "") != "development":
        Timer(1, _internal_open_webbrowser).start()

    print(
        "\n\n\n\nIf your browser doesn't open. "
        "Please navigate to '{url}'\n\n\n\n".format(url=_url(host, port)))

    app = create_app(**kwargs)
    app.run(host=host, port=port)
