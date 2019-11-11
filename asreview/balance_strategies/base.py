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

from abc import ABC, abstractmethod

from asreview.utils import _unsafe_dict_update


class BaseTrainData(ABC):
    " Abstract class for balance strategies. "
    def __init__(self, balance_kwargs):
        self.balance_kwargs = self.default_kwargs()
        self.balance_kwargs = _unsafe_dict_update(self.balance_kwargs,
                                                  balance_kwargs)

    def func_kwargs_descr(self):
        " Should give back the function and arguments for balancing. "
        return (self.__class__.function(), self.balance_kwargs,
                self.__class__.description())

    def default_kwargs(self):
        return {}

    def hyperopt_space(self):
        return {}

    @staticmethod
    @abstractmethod
    def function():
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    def description():
        raise NotImplementedError
