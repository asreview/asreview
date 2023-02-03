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

import argparse
import warnings
from abc import ABC
from abc import abstractclassmethod
from argparse import RawTextHelpFormatter


class DeprecateAction(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        warnings.warn(f"Argument {self.option_strings} is deprecated and is ignored.")
        delattr(namespace, self.dest)


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


def _base_parser(prog=None, description=None):
    """Argument parser for simulate.

    Parameters
    ----------
    mode : str
        The mode to run ASReview.
    prog : str
        The program name. For example 'asreview'.

    Returns
    -------
    argparse.ArgumentParser
        Configured argparser.
    """

    # parse arguments if available
    parser = argparse.ArgumentParser(
        prog=prog, description=description, formatter_class=RawTextHelpFormatter
    )
    parser.add_argument(
        "--embedding",
        type=str,
        default=None,
        dest="embedding_fp",
        help="File path of embedding matrix. Required for LSTM models.",
    )
    return parser
