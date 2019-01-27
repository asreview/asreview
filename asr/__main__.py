#!/usr/bin/env python
# encoding: utf-8

"""CLI for ASR project."""

import sys
import argparse
import warnings

# don't show warnings in CLI app
warnings.simplefilter("ignore")

from asr.review import review_interactive, review_oracle  # noqa


MODES = ["interactive", "oracle"]

MODEL = 'lstm'
QUERY_STRATEGY = 'lc'

EPOCHS = 3
BATCH_SIZE = 64

N_INCLUDED = 10
N_EXCLUDED = 40
N_INSTANCES = 50


def parse_arguments(prog=sys.argv[0]):

    # parse arguments if available
    parser = argparse.ArgumentParser(
        prog=prog,
        description='Systematic review with the help of an oracle.'
    )
    # File path to the data.
    parser.add_argument(
        "dataset",
        type=str,
        metavar='X',
        help=("File path to the dataset. The dataset " +
              "needs to be in the standardised format.")
    )
    # Active learning parameters
    parser.add_argument(
        '--model',
        type=str,
        default=MODEL,
        help="The prediction model for Active Learning. Default 'LSTM'.")
    parser.add_argument(
        "--query_strategy",
        type=str,
        default=QUERY_STRATEGY,
        help="The query strategy for Active Learning. Default 'lc'.")
    parser.add_argument(
        "--n_instances",
        default=N_INSTANCES,
        type=int,
        help='Number of papers queried each query.')
    parser.add_argument(
        "--n_queries",
        type=int,
        default=None,
        help="The number of queries. Default None"
    )

    # Initial data (prior knowledge)
    parser.add_argument(
        "--n_included",
        default=None,
        type=int,
        nargs="*",
        help='Initial included papers.')

    parser.add_argument(
        "--n_excluded",
        default=None,
        type=int,
        nargs="*",
        help='Initial excluded papers.')

    parser.add_argument(
        "--verbose",
        default=1,
        type=int,
        help='Verbosity')

    return parser


def _review_interactive():

    parser = parse_arguments(prog="asr interactive")
    args = parser.parse_args(sys.argv[2:])

    args_dict = vars(args)
    path = args_dict.pop("dataset")

    review_interactive(path, **args_dict)


def _review_oracle():
    """CLI to the oracle mode."""

    parser = parse_arguments(prog="asr oracle")
    args = parser.parse_args(sys.argv[2:])

    args_dict = vars(args)
    path = args_dict.pop("dataset")

    review_oracle(path, **args_dict)


def main():

    # launch asr interactively
    if len(sys.argv) > 1 and sys.argv[1] == "interactive":
        _review_interactive()

    # launch asr with oracle
    elif len(sys.argv) > 1 and sys.argv[1] == "oracle":
        _review_oracle()

    # no valid sub command
    else:
        parser = argparse.ArgumentParser(
            prog="asr",
            description='Automated Systematic Review.'
        )
        parser.add_argument(
            "subcommand",
            type=lambda x: isinstance(x, str) and x in MODES,
            help="the subcommand to launch"
        )
        parser.parse_args()


# execute main function
main()
