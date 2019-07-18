#!/usr/bin/env python
# encoding: utf-8

"""CLI for ASR project."""

import sys
import argparse
import warnings
import os

import numpy as np

# don't show warnings in CLI app
# warnings.simplefilter("ignore")

from asreview import __version__  # noqa
from asreview.review import review_oracle, review_simulate  # noqa
from asreview.config import AVAILABLE_MODI  # noqa

DEFAULT_MODEL = "lstm_base"
DEFAULT_QUERY_STRATEGY = "uncertainty"
DEFAULT_BALANCE_STRATEGY = "simple"
DEFAULT_N_INSTANCES = 50


def parse_arguments(mode, prog=sys.argv[0]):

    # parse arguments if available
    parser = argparse.ArgumentParser(
        prog=prog,
        description="Systematic review with the help of an oracle."
    )
    # File path to the data.
    parser.add_argument(
        "dataset",
        type=str,
        metavar="X",
        help=("File path to the dataset. The dataset " +
              "needs to be in the standardised format.")
    )
    # Active learning parameters
    parser.add_argument(
        "-m", "--model",
        type=str,
        default=DEFAULT_MODEL,
        help="The prediction model for Active Learning. Default 'LSTM'.")
    parser.add_argument(
        "-q", "--query_strategy",
        type=str,
        default=DEFAULT_QUERY_STRATEGY,
        help="The query strategy for Active Learning. Default 'uncertainty'.")
    parser.add_argument(
        "-b", "--balance_strategy",
        type=str,
        default=DEFAULT_BALANCE_STRATEGY,
        help="Data rebalancing strategy mainly for RNN methods. Helps against"
             " imbalanced dataset with few inclusions and many exclusions.")
    parser.add_argument(
        "--n_instances",
        default=DEFAULT_N_INSTANCES,
        type=int,
        help="Number of papers queried each query.")
    parser.add_argument(
        "--n_queries",
        type=int,
        default=None,
        help="The number of queries. Default None"
    )
    parser.add_argument(
        "--embedding",
        type=str,
        default=None,
        dest='embedding_fp',
        help="File path of embedding matrix. Required for LSTM model."
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
        help="Initial included papers.")

    parser.add_argument(
        "--prior_excluded",
        default=None,
        type=int,
        nargs="*",
        help="Initial included papers.")

    # these flag are only available for the simulation modus
    if mode == "simulate":

        # Initial data (prior knowledge)
        parser.add_argument(
            "--n_prior_included",
            default=10,
            type=int,
            nargs="*",
            help="Sample n prior included papers. "
                 "Only used when --prior_included is not given.")

        parser.add_argument(
            "--n_prior_excluded",
            default=10,
            type=int,
            nargs="*",
            help="Sample n prior excluded papers. "
                 "Only used when --prior_excluded is not given.")

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
        default=1,
        type=int,
        help="Verbosity")

    return parser


def _review_oracle():

    parser = parse_arguments("oracle", prog="asr oracle")
    args = parser.parse_args(sys.argv[2:])

    args_dict = vars(args)
    path = args_dict.pop("dataset")

    review_oracle(path, **args_dict)


def _review_simulate():
    """CLI to the oracle mode."""

    parser = parse_arguments("simulate", prog="asr simulate")
    args = parser.parse_args(sys.argv[2:])

    args_dict = vars(args)
    path = args_dict.pop("dataset")

    review_simulate(path, **args_dict)


def main_depr():
    warnings.warn("'asr' has been renamed to "
                  "'asreview', it will be removed in the future.\n",
                  np.VisibleDeprecationWarning)
    main()


def main():
    # launch asr interactively
    if len(sys.argv) > 1 and sys.argv[1] == "oracle":
        _review_oracle()

    # launch asr with oracle
    elif len(sys.argv) > 1 and sys.argv[1] == "simulate":
        _review_simulate()

    # no valid sub command
    else:
        parser = argparse.ArgumentParser(
            prog="asr",
            description="Automated Systematic Review."
        )
        parser.add_argument(
            "subcommand",
            nargs="?",
            type=lambda x: isinstance(x, str) and x in AVAILABLE_MODI,
            default=None,
            help=f"The subcommand to launch. Available commands:"
            f" {AVAILABLE_MODI}"
        )

        # version
        parser.add_argument(
            "-V", "--version",
            action='store_true',
            help="print the ASR version number and exit")

        args = parser.parse_args()

        # output the version
        if args.version:
            print(__version__)
            return

        if args.subcommand is None:
            print("Use 'asr -h' to view help.")


# execute main function
if __name__ == "__main__":
    main()
