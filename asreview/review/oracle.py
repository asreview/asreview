import numpy as np

from asreview.review import BaseReview
from asreview.review.base import _merge_prior_knowledge
from asreview.ascii import ASCII_TEA
from asreview.config import NOT_AVAILABLE
from asreview.types import convert_list_type


class ReviewOracle(BaseReview):
    """ Review class for Oracle mode on the command line. """

    def __init__(self, X, as_data, *args, use_cli_colors=True,
                 **kwargs):
        super(ReviewOracle, self).__init__(
            X,
            y=np.tile([NOT_AVAILABLE], X.shape[0]),
            *args,
            **kwargs)

        self.as_data = as_data

        self.use_cli_colors = use_cli_colors

    def priors_from_cli(self, force=False):
        if self.prior_included is None or force:
            # provide prior knowledge
            print("Are there papers you definitively want to include?")
            prior_included = input(
                "Give the indices of these papers. "
                "Separate them with spaces.\n"
                "Include: ")
            self.prior_included = convert_list_type(
                prior_included.split(), int)

        if self.prior_excluded is None or force:
            print("Are there papers you definitively want to exclude?")
            prior_excluded = input(
                "Give the indices of these papers. "
                "Separate them with spaces.\n"
                "Exclude: ")
            self.prior_excluded = convert_list_type(
                prior_excluded.split(), int)

    def _prior_knowledge(self):
        """Create prior knowledge from arguments."""

        self.priors_from_cli()
        prior_indices, prior_labels = _merge_prior_knowledge(
            self.prior_included, self.prior_excluded)
        return np.array(prior_indices, dtype=np.int), np.array(
            prior_labels, dtype=np.int)

    def _prior_teach(self):

        print("\n\n We work, you drink tea.\n")
        print(ASCII_TEA)

    def _format_paper(self,
                      title=None,
                      abstract=None,
                      keywords=None,
                      authors=None):

        if self.use_cli_colors:
            title = "\033[95m" + title + "\033[0m"

        return f"\n{title}\n{authors}\n\n{abstract}\n"

    def _get_labels_paper(self, index):
        # CLI paper format
        self.as_data.print_record(index)

        def _interact():
            # interact with the user
            included = input("Include [1] or exclude [0] (stop [S]): ")

            try:
                if included not in ["0", "1", "S", "s"]:
                    raise ValueError

                # stop by raising KeyBoardError
                if included in ["s", "S", "STOP"]:
                    stop_input = input("Are you sure you want to stop [y/n]: ")
                    if stop_input in ["Y", "y", "yes"]:
                        raise KeyboardInterrupt
                    return _interact()

                return int(included)

            except ValueError:

                # try again
                print(f"Incorrect value '{included}'")
                return _interact()

        included = _interact()

        if included == 1:
            label = 1
        elif included == 0:
            label = 0
        else:
            raise Exception

        return label

    def _get_labels(self, ind):

        y = np.zeros((len(ind), ), dtype=int)

        for j, index in enumerate(ind):

            label = self._get_labels_paper(index)

            y[j] = label

        return y
