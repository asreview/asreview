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

from asreview.entry_points.base import BaseEntryPoint
from asreview.webapp.run_model import main as main_run_model
from asreview.webapp.start_flask import main as main_flask


class LABEntryPoint(BaseEntryPoint):
    """Entry point to start the ASReview LAB webapp."""

    def execute(self, argv):

        main_flask(argv)


class WebRunModelEntryPoint(BaseEntryPoint):
    description = "Internal use only."

    def execute(self, argv):
        main_run_model(argv)
