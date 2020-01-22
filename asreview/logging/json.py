# Copyright 2019 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json
from collections import OrderedDict
from datetime import datetime
from pathlib import Path

from asreview.settings import ASReviewSettings
from asreview.logging.dict import DictLogger


class JSONLogger(DictLogger):
    """Class for logging a Systematic Review using JSON files."""
    version = "2.1"

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
