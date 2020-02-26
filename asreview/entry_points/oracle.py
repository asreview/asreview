import argparse
from argparse import RawTextHelpFormatter
import logging

from asreview.ascii import welcome_message

from asreview.config import DEFAULT_MODEL, DEFAULT_FEATURE_EXTRACTION
from asreview.config import DEFAULT_QUERY_STRATEGY
from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_N_INSTANCES
from asreview.entry_points.base import BaseEntryPoint
from asreview.review import review_oracle


class OracleEntryPoint(BaseEntryPoint):
    description = "Perform a systematic review on the command line."

    def execute(self, argv):
        parser = _oracle_parser()
        parser.add_argument(
            "--new",
            default=False,
            action="store_true",
            help="Start review from scratch."
        )
        args = parser.parse_args(argv)

        args_dict = vars(args)
        path = args_dict.pop("dataset")

        verbose = args_dict.get("verbose", 0)
        if verbose == 0:
            logging.getLogger().setLevel(logging.WARNING)
        elif verbose == 1:
            logging.getLogger().setLevel(logging.INFO)
        elif verbose >= 2:
            logging.getLogger().setLevel(logging.DEBUG)

        print(welcome_message("oracle"))
        review_oracle(path, **args_dict)


DESCRIPTION_ORACLE = """
Automated Systematic Review (ASReview) with interaction with oracle.

The oracle modus is used to perform a systematic review with
interaction by the reviewer (the ‘oracle’ in literature on active
learning). The software presents papers to the reviewer, whereafter
the reviewer classifies them."""


def _oracle_parser(prog="oracle", description=DESCRIPTION_ORACLE):
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

    # parse arguments if available
    parser = argparse.ArgumentParser(
        prog=prog,
        description=description,
        formatter_class=RawTextHelpFormatter
    )
    # File path to the data.
    parser.add_argument(
        "dataset",
        type=str,
        nargs="*",
        help="File path to the dataset or one of the built-in datasets."
    )
    # Active learning parameters
    parser.add_argument(
        "-m", "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"The prediction model for Active Learning. "
             f"Default: '{DEFAULT_MODEL}'.")  #noqa
    parser.add_argument(
        "-q", "--query_strategy",
        type=str,
        default=DEFAULT_QUERY_STRATEGY,
        help=f"The query strategy for Active Learning. "
             f"Default: '{DEFAULT_QUERY_STRATEGY}'.")  #noqa
    parser.add_argument(
        "-b", "--balance_strategy",
        type=str,
        default=DEFAULT_BALANCE_STRATEGY,
        help="Data rebalancing strategy mainly for RNN methods. Helps against"
             " imbalanced dataset with few inclusions and many exclusions. "
             f"Default: '{DEFAULT_BALANCE_STRATEGY}'")
    parser.add_argument(
        "-e", "--feature_extraction",
        type=str,
        default=DEFAULT_FEATURE_EXTRACTION,
        help="Feature extraction method. Some combinations of feature"
             " extraction method and prediction model are impossible/ill"
             " advised."
             f"Default: '{DEFAULT_FEATURE_EXTRACTION}'"
    )
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
#     # Initial data (prior knowledge)
#     parser.add_argument(
#         "--prior_included",
#         default=None,
#         type=int,
#         nargs="*",
#         help="A list of included papers.")
#
#     parser.add_argument(
#         "--prior_excluded",
#         default=None,
#         type=int,
#         nargs="*",
#         help="A list of excluded papers. Optional.")

    parser.add_argument(
        "--included_dataset",
        default=[],
        nargs="*",
        type=str,
        help="A dataset with papers that should be included"
             "Can be used multiple times."
    )
    parser.add_argument(
        "--excluded_dataset",
        default=[],
        nargs="*",
        type=str,
        help="A dataset with papers that should be excluded"
             "Can be used multiple times."
    )
    parser.add_argument(
        "--prior_dataset",
        default=[],
        nargs="*",
        type=str,
        help="A dataset with papers from prior studies."
    )
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
