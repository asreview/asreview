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

'''
Expose selection of query methods.
'''
from asreview.utils import _unsafe_dict_update


class BaseQueryStrategy(ABC):
    "Abstract class for query strategies."
    def __init__(self, query_kwargs, *_, **__):
        self.query_kwargs = self.default_kwargs()
        self.balance_kwargs = _unsafe_dict_update(self.query_kwargs,
                                                  query_kwargs)

    def func_kwargs_descr(self):
        return (self.__class__.function(), self.query_kwargs,
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
