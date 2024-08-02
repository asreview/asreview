from pathlib import Path
from huey import SqliteHuey
from asreview.webapp.utils import asreview_path

db_path = asreview_path() / Path("huey.sqlite")
huey = SqliteHuey(name="asreview", filename=db_path, immediate=False, results=False)
