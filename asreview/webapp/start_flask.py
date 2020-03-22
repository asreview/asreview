import os
import sys
from pathlib import Path
# import webbrowser

from flask import Flask, send_from_directory
from flask.templating import render_template
from flask_cors import CORS

from asreview.webapp import api
from asreview.entry_points.simulate import _base_parser


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
    print(kwargs)
    kwargs.pop("save_model_fp", None)
#     webbrowser.open("http://127.0.0.1:5000/")
    app = create_app(**kwargs)
    app.run()


if __name__ == "__main__":
    main(sys.argv[1:])
