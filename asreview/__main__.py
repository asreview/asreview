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

"""Command Line Interface (CLI) for ASReview project."""
import argparse
import logging
import sys
import warnings
from argparse import RawTextHelpFormatter

from asreview.ascii import welcome_message


import numpy as np  # noqa
import tensorflow as tf # noqa
try:
    tf.logging.set_verbosity(tf.logging.ERROR)
except AttributeError:
    logging.getLogger("tensorflow").setLevel(logging.ERROR)

from asreview import __version__  # noqa
from asreview.review import review_oracle, review_simulate  # noqa
from asreview.config import AVAILABLE_CLI_MODI  # noqa
from asreview.config import (  # noqa
    DEFAULT_MODEL, DEFAULT_QUERY_STRATEGY, DEFAULT_BALANCE_STRATEGY,
    DEFAULT_N_INSTANCES, DEFAULT_N_PRIOR_INCLUDED, DEFAULT_N_PRIOR_EXCLUDED)


# Descriptions

PROG_DESCRIPTION = f"""
Automated Systematic Review (ASReview).

Use one of the modi: '{AVAILABLE_CLI_MODI[0]}' or '{AVAILABLE_CLI_MODI[1]}'
"""

PROG_DESCRIPTION_SIMULATE = """
Automated Systematic Review (ASReview) for simulation runs.

The simulation modus is used to measure the performance of our
software on existing systematic reviews. The software shows how many
papers you could have potentially skipped during the systematic
review."""

PROG_DESCRIPTION_ORACLE = """
Automated Systematic Review (ASReview) with interaction with oracle.

The oracle modus is used to perform a systematic review with
interaction by the reviewer (the ‘oracle’ in literature on active
learning). The software presents papers to the reviewer, whereafter
the reviewer classifies them."""


def _parse_arguments(mode, prog=sys.argv[0]):
    """Argument parser for oracle and simulate.

    Parameters
    ----------
    mode : str
        The mode to run ASReview. Options:
        'simulate' and 'oracle'.
    prog : str
        The program name. For example 'asreview'.

    Returns
    -------
    argparse.ArgumentParser
        Configured argparser.
    """

    if mode == "simulate":
        prog_description = PROG_DESCRIPTION_SIMULATE
    elif mode == "oracle":
        prog_description = PROG_DESCRIPTION_ORACLE
    else:
        prog_description = ""

    # parse arguments if available
    parser = argparse.ArgumentParser(
        prog=prog,
        description=prog_description,
        formatter_class=RawTextHelpFormatter
    )
    # File path to the data.
    parser.add_argument(
        "dataset",
        type=str,
        metavar="X",
        help="File path to the dataset or one of the built-in datasets."
    )
    # Active learning parameters
    parser.add_argument(
        "-m", "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"The prediction model for Active Learning. "
             f"Default '{DEFAULT_MODEL}'.")  #noqa
    parser.add_argument(
        "-q", "--query_strategy",
        type=str,
        default=DEFAULT_QUERY_STRATEGY,
        help=f"The query strategy for Active Learning. "
             f"Default '{DEFAULT_QUERY_STRATEGY}'.")  #noqa
    parser.add_argument(
        "-b", "--balance_strategy",
        type=str,
        default=DEFAULT_BALANCE_STRATEGY,
        help="Data rebalancing strategy mainly for RNN methods. Helps against"
             " imbalanced dataset with few inclusions and many exclusions. "
             f"Default '{DEFAULT_BALANCE_STRATEGY}'")
    parser.add_argument(
        "--n_instances",
        default=DEFAULT_N_INSTANCES,
        type=int,
        help="Number of papers queried each query."
             f"Default {DEFAULT_N_INSTANCES}.")
    parser.add_argument(
        "--n_queries",
        type=int,
        default=None,
        help="The number of queries. By default, the program "
             "stops after all documents are reviewed or is "
             "interrupted by the user."
    )
    parser.add_argument(
        "-n", "--n_papers",
        type=int,
        default=None,
        help="The number of papers to be reviewed. By default, "
             "the program stops after all documents are reviewed or is "
             "interrupted by the user."
    )
    parser.add_argument(
        "--embedding",
        type=str,
        default=None,
        dest='embedding_fp',
        help="File path of embedding matrix. Required for LSTM models."
    )
    # Configuration file with model/balance/query parameters.
    parser.add_argument(
        "--config_file",
        type=str,
        default=None,
        help="Configuration file with model parameters"
    )
    # Initial data (prior knowledge)
    parser.add_argument(
        "--prior_included",
        default=None,
        type=int,
        nargs="*",
        help="A list of included papers.")

    parser.add_argument(
        "--prior_excluded",
        default=None,
        type=int,
        nargs="*",
        help="A list of excluded papers. Optional.")

    parser.add_argument(
        "--extra_dataset",
        default=[],
        action='append',
        help="A dataset with labels to improve training. Can be used multiple"
             " times."
    )

    # these flag are only available for the simulation modus
    if mode == "simulate":

        # Initial data (prior knowledge)
        parser.add_argument(
            "--n_prior_included",
            default=DEFAULT_N_PRIOR_INCLUDED,
            type=int,
            help="Sample n prior included papers. "
                 "Only used when --prior_included is not given. "
                 f"Default {DEFAULT_N_PRIOR_INCLUDED}")

        parser.add_argument(
            "--n_prior_excluded",
            default=DEFAULT_N_PRIOR_EXCLUDED,
            type=int,
            help="Sample n prior excluded papers. "
                 "Only used when --prior_excluded is not given. "
                 f"Default {DEFAULT_N_PRIOR_EXCLUDED}")

    # logging and verbosity
    parser.add_argument(
        "--log_file", "-l",
        default=None,
        type=str,
        help="Location to store the log results."
    )
    parser.add_argument(
        "--save_model",
        default=None,
        type=str,
        dest='save_model_fp',
        help="Location to store the model and weights. "
             "Only works for Keras/RNN models. "
             "End file extension with '.json'."
    )
    parser.add_argument(
        "--verbose", "-v",
        default=0,
        type=int,
        help="Verbosity")

    return parser


def _review_general(mode="oracle"):
    parser = _parse_arguments(mode, prog="asreview " + mode)
    args = parser.parse_args(sys.argv[2:])

    args_dict = vars(args)
    path = args_dict.pop("dataset")

    verbose = args_dict.get("verbose", 0)
    if verbose == 0:
        logging.getLogger().setLevel(logging.WARNING)
    elif verbose == 1:
        logging.getLogger().setLevel(logging.INFO)
    elif verbose >= 2:
        logging.getLogger().setLevel(logging.DEBUG)

    print(welcome_message(mode))
    if mode == "oracle":
        review_oracle(path, **args_dict)
    elif mode == "simulate":
        review_simulate(path, **args_dict)


def main_depr():
    warnings.warn("'asr' has been renamed to "
                  "'asreview', it will be removed in the future.\n",
                  np.VisibleDeprecationWarning)
    main()


def main():
    # launch asr interactively
    if len(sys.argv) > 1 and sys.argv[1] in ["oracle", "simulate"]:
        _review_general(sys.argv[1])

    # no valid sub command
    else:
        parser = argparse.ArgumentParser(
            prog="asreview",
            description=PROG_DESCRIPTION
        )
        parser.add_argument(
            "subcommand",
            nargs="?",
            type=lambda x: isinstance(x, str) and x in AVAILABLE_CLI_MODI,
            default=None,
            help=f"The subcommand to launch. Available commands: "
            f"{AVAILABLE_CLI_MODI}"
        )

        # version
        parser.add_argument(
            "-V", "--version",
            action='store_true',
            help="print the ASR version number and exit")

        args, _ = parser.parse_known_args()

        # output the version
        if args.version:
            print(__version__)
            return

        parser.print_help()


# execute main function
if __name__ == "__main__":
    main()
