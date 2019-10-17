import numpy as np

from asreview.ascii import ASCII_TEA
from asreview.config import NOT_AVAILABLE
from asreview.review import BaseReview
from asreview.review.base import _merge_prior_knowledge
from asreview.types import convert_list_type


def update_stats(stats, label):
    if label == 1:
        stats["n_included"] += 1
        stats["last_inclusion"] = 0
    else:
        stats["n_excluded"] += 1
        stats["last_inclusion"] += 1
    stats["n_reviewed"] += 1
    stats["n_pool"] -= 1


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
            print("\nAre there papers you definitively want to include?")
            prior_included = input(
                "Give the indices of these papers. "
                "Separate them with spaces.\n"
                "Include: ")
            self.prior_included = convert_list_type(
                prior_included.split(), int)

        if self.prior_excluded is None or force:
            print("\nAre there papers you definitively want to exclude?")
            prior_excluded = input(
                "Give the indices of these papers. "
                "Separate them with spaces.\n"
                "Exclude: ")
            self.prior_excluded = convert_list_type(
                prior_excluded.split(), int)

    def train(self, *args, **kwargs):
        print(ASCII_TEA)
        super(ReviewOracle, self).train(*args, **kwargs)

    def review(self, *args, instant_save=True, **kwargs):
        try:
            super(ReviewOracle, self).review(*args, instant_save=instant_save,
                                             **kwargs)
        except KeyboardInterrupt:
            self._export()

    def _export(self):
        try:
            while(True):
                export_input = input(
                    "\nExport to file? Give filename ending "
                    "with .csv or .ris.\n Leave blank for no export:  ")
                if len(export_input) == 0:
                    break
                if export_input.endswith((".csv", ".ris")):
                    pred_proba = self.query_kwargs.get('pred_proba', None)
                    pool_idx = np.delete(np.arange(len(self.y)),
                                         self.train_idx)
                    if pred_proba is not None:
                        proba_order = np.argsort(pred_proba[pool_idx, 1])
                    else:
                        proba_order = np.arange(len(pool_idx))
                    df_order = np.append(self.train_idx, pool_idx[proba_order])
                    assert len(df_order) == len(self.y)
                    for i in range(len(self.y)):
                        assert i in df_order
                    labels = np.full(len(self.y), np.nan, dtype=object)
                    labels[self.train_idx] = self.y[self.train_idx]
                    self.as_data.to_file(fp=export_input, labels=labels,
                                         df_order=df_order)
                    break
                print("Either leave blank or give filename that ends with "
                      "'.csv'.")
        except KeyboardInterrupt:
            pass
        print('\nClosing down the automated systematic review.')

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

    def _get_labels_paper(self, index, stat_str=None):
        # CLI paper format
        self.as_data.print_record(index)
        print(stat_str + "\n")

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

    def get_stats(self, stats):
        n_included = stats["n_included"]
        n_papers = stats["n_papers"]
        n_reviewed = stats["n_reviewed"]
        perc_read = 100*(stats["n_reviewed"]/stats["n_papers"])
        if(n_reviewed == 0):
            perc_included = np.nan
        else:
            perc_included = 100*n_included/n_reviewed
        last_inclusion = stats["last_inclusion"]
        stat_str = (f"| {perc_read:.2f}% read | {last_inclusion} since last "
                    f"inclusion | {perc_included:.2f}% included |"
                    f" total papers: {n_papers} |")
        return stat_str

    def _get_labels(self, ind):

        y = np.zeros((len(ind), ), dtype=np.int)
        stats = self.statistics()

        for j, index in enumerate(ind):
            label = self._get_labels_paper(index,
                                           stat_str=self.get_stats(stats))
            update_stats(stats, label)
            y[j] = label

        return y
