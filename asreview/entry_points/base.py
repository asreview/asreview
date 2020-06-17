import argparse
from argparse import RawTextHelpFormatter

from abc import ABC, abstractclassmethod

from asreview.config import DEFAULT_MODEL, DEFAULT_FEATURE_EXTRACTION
from asreview.config import DEFAULT_QUERY_STRATEGY
from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_N_INSTANCES
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
        "--state_file", "-s", "--log_file", "-l",
        default=None,
        type=str,
        help="Location to store the state of the simulation."
    )
    parser.add_argument(
        "--seed",
        default=None,
        type=int,
        help="Seed for models. Use integer between 0 and 2^32 - 1."
    )
    parser.add_argument(
        "--abstract_only",
        default=False,
        action='store_true',
        help="Use after abstract screening as the inclusions/exclusions."
    )
    return parser
