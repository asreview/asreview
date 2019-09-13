import numpy as np

from asreview.review import BaseReview
from asreview.review.base import _merge_prior_knowledge
from asreview.ascii import ASCII_TEA
from asreview.config import NOT_AVAILABLE

class ReviewOracle(BaseReview):
    """Automated Systematic Review"""

    def __init__(self, X, as_data, use_cli_colors=True,
                 *args, **kwargs):
        super(ReviewOracle, self).__init__(
            X,
            y=np.tile([NOT_AVAILABLE], X.shape[0]),
            *args,
            **kwargs)

        self.as_data = as_data

        self.use_cli_colors = use_cli_colors

    def _prior_knowledge(self):
        """Create prior knowledge from arguments."""

        prior_indices, prior_labels = _merge_prior_knowledge(
            self.prior_included, self.prior_excluded)

        return prior_indices, prior_labels

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
            included = input("Include [1] or exclude [0]: ")

            try:
                included = int(included)

                if included not in [0, 1]:
                    raise ValueError

                return included
            except Exception:

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

        y = np.zeros((len(ind), ))

        for j, index in enumerate(ind):

            label = self._get_labels_paper(index)

            y[j] = label

        return y
