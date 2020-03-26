import os
import sys
from pathlib import Path
import webbrowser
from threading import Timer

from flask import Flask, send_from_directory
from flask.templating import render_template
from flask_cors import CORS

from asreview.webapp import api
from asreview.entry_points.simulate import _base_parser

PORT_NUMBER = 5000


def _open_browser():
    webbrowser.open_new('http://127.0.0.1:{}/'.format(PORT_NUMBER))


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
    parser = _base_parser(prog="oracle")
    kwargs = vars(parser.parse_args(argv))

    # open webbrowser if not in flask development mode
    if os.environ.get('FLASK_ENV', "") != "development":
        Timer(1, _open_browser).start()

    print(
        "\n\n\n\nIf your browser doesn't open. "
        "Please navigate to 'http://127.0.0.1:{}/'\n\n\n\n".format(PORT_NUMBER)
    )
    app = create_app(**kwargs)
    app.run(port=PORT_NUMBER)


if __name__ == "__main__":
    main(sys.argv[1:])
