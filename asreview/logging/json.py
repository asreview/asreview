import json
from collections import OrderedDict
from datetime import datetime
from pathlib import Path

from asreview.settings import ASReviewSettings
from asreview.logging.dict import DictLogger


class JSONLogger(DictLogger):
    """Class for logging a Systematic Review using JSON files."""
    version = "2.0"

    def __init__(self, log_fp, read_only=False):
        super(JSONLogger, self).__init__(log_fp)
        self.read_only = read_only

    def save(self):
        if self.read_only:
            raise ValueError("Logging error: trying to save when opened file"
                             " in read_only mode.")
        self._log_dict["time"]["end_time"] = str(datetime.now())
        fp = Path(self.log_fp)

        if fp.is_file:
            fp.parent.mkdir(parents=True, exist_ok=True)

        with fp.open('w') as outfile:
            json.dump(self._log_dict, outfile, indent=2)

    def restore(self, fp):
        try:
            with open(fp, "r") as f:
                self._log_dict = OrderedDict(json.load(f))
            log_version = self._log_dict["version"]
            if log_version != self.version:
                raise ValueError(
                    f"Log cannot be read: logger version {self.version}, "
                    f"logfile version {log_version}.")
            self.settings = ASReviewSettings(**self._log_dict["settings"])
        except FileNotFoundError:
            self.initialize_structure()
