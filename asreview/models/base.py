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

from abc import ABC
import inspect

import numpy as np


def sig_to_param(signature):
    return {
        k: v.default
        for k, v in signature.parameters.items()
        if v.default is not inspect.Parameter.empty
    }


class BaseModel(ABC):
    """Abstract class for any kind of model."""

    name = "base"

    @property
    def default_param(self):
        """Get the default parameters of the model.

        Returns
        -------
        dict
            Dictionary with parameter: default value
        """
        cur_class = self.__class__
        default_parameters = sig_to_param(inspect.signature(self.__init__))
        while cur_class != BaseModel:
            signature = inspect.signature(super(cur_class, self).__init__)
            new_parameters = sig_to_param(signature)
            default_parameters.update(new_parameters)
            cur_class = cur_class.__bases__[0]
        return default_parameters

    @property
    def param(self):
        """Get the (assigned) parameters of the model.

        Returns
        -------
        dict
            Dictionary with parameter: current value.
        """
        parameters = self.default_param
        for par in list(parameters):
            try:
                parameters[par] = getattr(self, par)
            except AttributeError:
                del parameters[par]
                continue
            if isinstance(parameters[par], np.integer):
                parameters[par] = int(parameters[par])

        return parameters

    def full_hyper_space(self):
        return {}, {}

    def hyper_space(self):
        hyper_space, hyper_choices = self.full_hyper_space()
        return hyper_space, hyper_choices
