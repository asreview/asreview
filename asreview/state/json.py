# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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

from collections import OrderedDict
from datetime import datetime
import json
from pathlib import Path

from asreview.settings import ASReviewSettings
from asreview.state.dict import DictState


class JSONState(DictState):
    """Class for storing the state of a Systematic Review using JSON files."""
    version = "2.1"

    def __init__(self, state_fp, read_only=False):
        super(JSONState, self).__init__(state_fp)
        self.read_only = read_only

    def save(self):
        if self.read_only:
            raise ValueError("State error: trying to save when opened file"
                             " in read_only mode.")
        self._state_dict["time"]["end_time"] = str(datetime.now())
        fp = Path(self.state_fp)

        if fp.is_file:
            fp.parent.mkdir(parents=True, exist_ok=True)

        try:
            self._state_dict["current_queries"] = {
                str(key): val
                for key, val in self._state_dict["current_queries"].items()
            }
        except KeyError:
            pass

        with fp.open('w') as outfile:
            json.dump(self._state_dict, outfile, indent=2)

        try:
            self._state_dict["current_queries"] = {
                int(key): val
                for key, val in self._state_dict["current_queries"].items()
            }
        except KeyError:
            pass

    def restore(self, fp):
        try:
            with open(fp, "r") as f:
                self._state_dict = OrderedDict(json.load(f))
            state_version = self._state_dict["version"]
            if state_version != self.version:
                raise ValueError(
                    f"State cannot be read: state version {self.version}, "
                    f"state file version {state_version}.")
            self.settings = ASReviewSettings(**self._state_dict["settings"])
            try:
                self._state_dict["current_queries"] = {
                    int(key): val
                    for key, val in
                    self._state_dict["current_queries"].items()
                }
            except KeyError:
                pass
        except FileNotFoundError:
            self.initialize_structure()
