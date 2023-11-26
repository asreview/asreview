# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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

__all__ = ["LABEntryPoint"]

import os

from asreview.webapp.entry_points.lab import lab_entry_point


def _deprecated_dev_mode():
    if os.environ.get("FLASK_DEBUG", "") == "1":
        print(
            "\n\n\n!IMPORTANT!\n\n"
            "asreview lab development mode is deprecated, see:\n"
            "https://github.com/J535D165/asreview/blob/master/DEVELOPMENT.md"
            "\n\n\n"
        )
        exit(1)


class LABEntryPoint(object):
    """Entry point to start the ASReview LAB webapp."""

    def execute(self, argv):
        # check deprecated dev mode
        _deprecated_dev_mode()

        lab_entry_point(argv)
