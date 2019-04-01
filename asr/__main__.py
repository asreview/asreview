#!/usr/bin/env python
# encoding: utf-8

"""CLI for ASR project."""

import sys
import argparse
import warnings

# don"t show warnings in CLI app
warnings.simplefilter("ignore")

from asr import __version__  # noqa
from asr.review import review_oracle, review_simulate  # noqa
from asr.config import MODUS

MODES = ["interactive", "oracle"]

MODEL = "lstm"
QUERY_STRATEGY = "uncertainty"

EPOCHS = 3
BATCH_SIZE = 64

N_INCLUDED = 10
N_EXCLUDED = 40
N_INSTANCES = 50


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
        default=MODEL,
        help="The prediction model for Active Learning. Default 'LSTM'.")
    parser.add_argument(
        "-q", "--query_strategy",
        type=str,
        default=QUERY_STRATEGY,
        help="The query strategy for Active Learning. Default 'uncertainty'.")
    parser.add_argument(
        "--n_instances",
        default=N_INSTANCES,
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
    parser.add_argument(
        "--frac_included",
        type=float,
        default=None,
        help="Fraction of included papers, an estimate for the classifier."
    )

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
    if mode == MODES[1]:

        # Initial data (prior knowledge)
        parser.add_argument(
            "--n_prior_included",
            default=10,
            type=int,
            nargs="*",
            help="Sample n prior included papers. Only used when --prior_included is not given.")

        parser.add_argument(
            "--n_prior_excluded",
            default=10,
            type=int,
            nargs="*",
            help="Sample n prior excluded papers. Only used when --prior_excluded is not given.")

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
        help="Location to store the model."
    )
    parser.add_argument(
        "--verbose", "-v",
        default=1,
        type=int,
        help="Verbosity")

    return parser


def _review_oracle():

    parser = parse_arguments(MODES[0], prog="asr oracle")
    args = parser.parse_args(sys.argv[2:])

    args_dict = vars(args)
    path = args_dict.pop("dataset")

    review_oracle(path, **args_dict)


def _review_simulate():
    """CLI to the oracle mode."""

    parser = parse_arguments(MODES[1], prog="asr simulate")
    args = parser.parse_args(sys.argv[2:])

    args_dict = vars(args)
    path = args_dict.pop("dataset")

    review_simulate(path, **args_dict)


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
            type=lambda x: isinstance(x, str) and x in MODES,
            default=None,
            help="the subcommand to launch"
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
