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

__all__ = ["BaseEntryPoint"]

from abc import ABC
from abc import abstractclassmethod


class BaseEntryPoint(ABC):
    """Base class for defining entry points."""

    @abstractclassmethod
    def execute(self, argv):
        """Perform the functionality of the entry point.

        Arguments
        ---------
        argv: list
            Argument list, with the entry point and program removed.
            For example, if `asreview plot X` is executed, then argv == ['X'].
        """
        raise NotImplementedError
