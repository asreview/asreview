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

import argparse
from abc import ABC, abstractclassmethod
from argparse import RawTextHelpFormatter

from asreview import __version__


class BaseEntryPoint(ABC):
    """Base class for defining entry points."""

    description = "Base Entry point."
    extension_name = "asreview"
    version = __version__

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

    def format(self, entry_name="?"):
        """Create a short formatted description of the entry point.

        Arguments
        ---------
        entry_name: str
            Name of the entry point. For example 'plot' in `asreview plot X`
        """
        description = self.description
        version = getattr(self, "version", "?")
        extension_name = getattr(self, "extension_name", "?")

        display_name = f"{entry_name} [{extension_name}-{version}]"

        return f"{display_name}\n    {description}"


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
        prog=prog,
        description=description,
        formatter_class=RawTextHelpFormatter
    )
    parser.add_argument(
        "--embedding",
        type=str,
        default=None,
        dest='embedding_fp',
        help="File path of embedding matrix. Required for LSTM models."
    )
    parser.add_argument(
        "--config_file",
        type=str,
        default=None,
        help="Configuration file with model settings"
             "and parameter values."
    )
    parser.add_argument(
        "--seed",
        default=None,
        type=int,
        help="Seed for the model (classifiers, balance "
             "strategies, feature extraction techniques, and query "
             "strategies). Use an integer between 0 and 2^32 - 1."
    )
    return parser
