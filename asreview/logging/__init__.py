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
'''Deprecated, will be removed in the future.'''

import warnings

from asreview.state.base import BaseState
from asreview.state.dict import DictState
from asreview.state.hdf5 import HDF5State
from asreview.state.json import JSONState
from asreview.state.utils import open_state


class BaseLogger(BaseState):
    warnings.warn("BaseLogger will be replaced by BaseState.",
                  category=FutureWarning)


class DictLogger(DictState):
    warnings.warn("DictLogger will be replaced by DictState.",
                  category=FutureWarning)


class HDF5Logger(HDF5State):
    warnings.warn("HDF5Logger will be replaced by HDF5State.",
                  category=FutureWarning)


class JSONLogger(JSONState):
    warnings.warn("JSONLogger will be replaced by JSONState.",
                  category=FutureWarning)


def open_logger(*args, **kwargs):
    warnings.warn("open_logger will be replaced by open_state.",
                  category=FutureWarning)
    return open_state(*args, **kwargs)
