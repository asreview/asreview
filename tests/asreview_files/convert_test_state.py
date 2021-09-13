from shutil import rmtree
from zipfile import ZipFile
from pathlib import Path

from asreview.state.sql_converter import upgrade_asreview_project_file

old_fp = Path('tests', 'asreview_files', 'test_state_example_old.asreview')
new_fp = Path('tests', 'asreview_files', 'test_state_example_converted.asreview')

if new_fp.exists():
    rmtree(new_fp)

with ZipFile(old_fp) as zipobj:
    zipobj.extractall(new_fp)

upgrade_asreview_project_file(new_fp)