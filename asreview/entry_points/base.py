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
        help="Configuration file with model, balance, and query parameters"
    )
    parser.add_argument(
        "--seed",
        default=None,
        type=int,
        help="Seed for models. Use integer between 0 and 2^32 - 1."
    )
    return parser
