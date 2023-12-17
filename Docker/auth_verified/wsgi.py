import os

from asreview.webapp.app import create_app

app = create_app(config_file=os.environ.get("FLASK_CONFIGFILE"))
