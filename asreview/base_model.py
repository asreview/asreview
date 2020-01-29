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

from abc import ABC
import inspect


class BaseModel(ABC):
    "Abstract class for balance strategies."
    name = "base"

    @property
    def default_param(self):
        """Get the default parameters of the balance strategy.

        Returns
        -------
        dict:
            Dictionary with parameter: default_value
        """
        signature = inspect.signature(self.__init__)
        return {
            k: v.default
            for k, v in signature.parameters.items()
            if v.default is not inspect.Parameter.empty
        }

    def full_hyper_space(self):
        return {}, {}

    def hyper_space(self):
        hyper_space, hyper_choices = self.full_hyper_space()
        return hyper_space, hyper_choices
