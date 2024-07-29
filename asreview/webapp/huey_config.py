from huey import SqliteHuey
from pathlib import Path
from asreview.webapp.utils import asreview_path


huey = SqliteHuey(
    name="asreview",
    filename=asreview_path() / Path('huey.sqlite')
)
