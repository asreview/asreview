import shutil
from pathlib import Path

from asreview.utils import asreview_path

def clear_folders_in_asreview_path():
    for item in Path(asreview_path()).glob("*"):
        if item.is_dir():
            shutil.rmtree(item)