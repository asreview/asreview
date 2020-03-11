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

import numpy as np
import questionary as questionary

from asreview.review import BaseReview
from asreview.types import convert_list_type
from asreview.logging.utils import open_logger
from asreview.config import LABEL_NA


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
    """Review class for Oracle mode on the command line."""
    name = "oracle"

    def __init__(self, as_data, *args, use_cli_colors=True,
                 new_review=False,
                 **kwargs):
        self.as_data = as_data
        if not new_review:
            start_idx = np.where(as_data.labels != LABEL_NA)[0]
        else:
            as_data.labels = np.full_like(as_data.labels, LABEL_NA)
            start_idx = []
        super(ReviewOracle, self).__init__(
            as_data, *args, **kwargs, start_idx=start_idx)

        self.use_cli_colors = use_cli_colors

    def _papers_from_finder(self, logger):
        "Find papers using a fuzzy finder in the available records."
        keywords = questionary.text(
            'Find papers using keywords/authors/title:'
        ).ask()

        if keywords is None:
            return

        paper_idx = self.as_data.fuzzy_find(keywords, exclude=self.train_idx)

        # Get the (possibly) relevant papers.
        choices = []
        for idx in paper_idx:
            choices.append(self.as_data.preview_record(idx,
                                                       automatic_width=True))
        choices.extend([questionary.Separator(), "Return"])

        # Stay in the same menu until no more options are left
        while len(choices) > 2:
            new_choice = questionary.select(
                'Choose a paper to review:',
                choices=choices,
            ).ask()

            if new_choice == "Return" or new_choice is None:
                return
            choice_idx = choices.index(new_choice)
            idx = paper_idx[choice_idx]

            # Get the label for the selected paper.
            label = self._get_labels_paper(idx, ask_stop=False)
            if label is not None:
                self.classify([idx], [label], logger, method="initial")

                # Remove the selected choice from the list.
                del choices[choice_idx]
                del paper_idx[choice_idx]
        return

    def _papers_from_id(self, logger):
        "Get papers by a list of IDs."
        include_question = questionary.text(
            'Which papers do you want to include?\n'
            'Separate paper indices by spaces:'
        )
        exclude_question = questionary.text(
            'Which papers do you want to exclude?\n'
            'Separate paper indices by spaces:'
        )
        included = include_question.ask()
        if included is None:
            return
        excluded = exclude_question.ask()
        if excluded is None:
            return

        new_included = convert_list_type(included.split(), int)
        new_excluded = convert_list_type(excluded.split(), int)
        self.classify(new_included, np.ones(len(new_included)),
                      logger, method="initial")
        self.classify(new_excluded, np.zeros(len(new_excluded)),
                      logger, method="initial")

    def main_menu(self, logger, *args, **kwargs):
        "Get initial papers for modelling."
        while True:
            n_included = np.sum(self.y[self.train_idx] == 1)
            n_excluded = np.sum(self.y[self.train_idx] == 0)
            action = questionary.select(
                'What do you want to do next?',
                choices=[
                    "Find papers by keywords",
                    "Find papers by ID",
                    questionary.Separator(),
                    f"Continue review ({n_included} included, "
                    f"{n_excluded} excluded)",
                    "Export",
                    questionary.Separator(),
                    "Stop"
                ]
            ).ask()

            if action is None or action.startswith("Stop"):
                stop = questionary.confirm(
                    "Are you sure you want to stop?",
                    default=False
                ).ask()
                if stop:
                    raise KeyboardInterrupt
            elif action.endswith("by keywords"):
                self._papers_from_finder(logger)
            elif action.endswith("by ID"):
                self._papers_from_id(logger)
            elif action.startswith("Export"):
                self._export()
            elif action.startswith("Continue review"):
                try:
                    self._do_review(logger, *args, **kwargs)
                except KeyboardInterrupt:
                    pass

    def review(self, *args, instant_save=True, **kwargs):
        with open_logger(self.log_file) as logger:
            self.main_menu(logger, *args, instant_save=instant_save, **kwargs)

    def _format_paper(self,
                      title=None,
                      abstract=None,
                      keywords=None,
                      authors=None):

        if self.use_cli_colors:
            title = "\033[95m" + title + "\033[0m"

        return f"\n{title}\n{authors}\n\n{abstract}\n"

    def _get_labels_paper(self, index, stat_str=None, ask_stop=False):
        """Ask the user for a label for a particular paper.

        Arguments
        ---------
        index: int
            Paper ID in the dataset.
        stat_str: str
            Display this (statistic) string under the paper.
        ask_stop: bool
            Ask for confirmation when stopping.
        """
        # CLI paper format
        self.as_data.print_record(index)
        if stat_str is not None:
            print(stat_str + "\n")

        action = questionary.select(
            'Include or Exclude?',
            choices=[
                'Exclude', 'Include', questionary.Separator(),
                'Back to main menu'
            ],
            default='Exclude',
        ).ask()

        if action == "Include":
            label = 1
        elif action == "Exclude":
            label = 0
        else:
            label = None

        return label

    def train(self, *args, **kwargs):
        super(ReviewOracle, self).train(*args, **kwargs)

    def _export(self):
        """Export the results to a csv file.

        Order of records is: [included, not reviewed (by proba), excluded]
        """
        file_name = questionary.text(
            'Type file name for export ending with .csv or .ris',
            validate=lambda val: val.endswith((".csv", ".ris")),
        ).ask()

        if file_name is None:
            return

        pred_proba = self.shared.get('pred_proba', None)
        pool_idx = np.delete(np.arange(len(self.y)), self.train_idx)
        if pred_proba is not None:
            proba_order = np.argsort(-pred_proba[pool_idx, 1])
        else:
            proba_order = np.arange(len(pool_idx))
        train_zero = self.train_idx[np.where(self.y[self.train_idx] == 0)[0]]
        train_one = self.train_idx[np.where(self.y[self.train_idx] == 1)[0]]
        df_order = np.concatenate(
            (train_one, pool_idx[proba_order], train_zero), axis=None)
        labels = np.full(len(self.y), np.nan, dtype=object)
        labels[self.train_idx] = self.y[self.train_idx]
        self.as_data.to_file(fp=file_name, labels=labels,
                             df_order=df_order)

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
                    f" total papers: {n_reviewed}/{n_papers} |")
        return stat_str

    def _get_labels(self, ind):
        "Get a sequence of labels."
        y = np.zeros((len(ind), ), dtype=np.int)
        stats = self.statistics()

        for j, index in enumerate(ind):
            label = self._get_labels_paper(index,
                                           stat_str=self.get_stats(stats))
            if label is None:
                raise KeyboardInterrupt
            update_stats(stats, label)
            y[j] = label

        return y
