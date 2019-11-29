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
from PyInquirer import prompt, Separator

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
        self.as_data = as_data
        super(ReviewOracle, self).__init__(
            X,
            y=np.tile([NOT_AVAILABLE], X.shape[0]),
            *args,
            **kwargs)

        self.use_cli_colors = use_cli_colors

    def _papers_from_finder(self):
        "Find papers using a fuzzy finder in the available records."
        question = [
            {
                'type': 'input',
                'name': 'keywords',
                'message': 'Find papers using keywords/authors/title:',
            }
        ]
        try:
            keywords = prompt(question)['keywords']
        except KeyError:
            return

        all_prior = self.prior_included + self.prior_excluded
        paper_idx = self.as_data.fuzzy_find(keywords, exclude=all_prior)

        # Get the (possibly) relevant papers.
        choices = []
        for idx in paper_idx:
            choices.append(self.as_data.preview_record(idx))
        choices.extend([Separator(), "return"])

        # Stay in the same menu until no more options are left
        while len(choices) > 2:
            question = [
                {
                    'type': 'list',
                    'name': 'paper',
                    'message': 'Choose a paper to review:',
                    'choices': choices
                }
            ]
            new_choice = prompt(question).get('paper', "return")
            if new_choice == "return":
                return
            choice_idx = choices.index(new_choice)
            idx = paper_idx[choice_idx]

            # Get the label for the selected paper.
            label = self._get_labels_paper(idx, ask_stop=False)
            if label == 1:
                self.prior_included.append(idx)
            elif label == 0:
                self.prior_excluded.append(idx)

            # Remove the selected choice from the list.
            del choices[choice_idx]
            del paper_idx[choice_idx]
        return

    def _papers_from_id(self):
        "Get papers by a list of IDs."
        question = [
            {
                'type': 'input',
                'name': 'included',
                'message': 'Which papers do you want to include?\n'
                'Separate paper indices by spaces:',
            },
            {
                'type': 'input',
                'name': 'excluded',
                'message': 'Which papers do you want to exclude?\n'
                'Separate paper indices by spaces:',
            }
        ]
        answer = prompt(question)
        try:
            included = answer["included"]
            excluded = answer["excluded"]
        except KeyError:
            return
        self.prior_included.extend(convert_list_type(included.split(), int))
        self.prior_excluded.extend(convert_list_type(excluded.split(), int))

    def priors_from_cli(self):
        "Get initial papers for modelling."
        while True:
            question = [
                {
                    'type': 'list',
                    'name': 'action',
                    'message': 'What do you want to do next?',
                    'choices': [
                        "Find papers by keywords",
                        "Add papers from ID's",
                        Separator(),
                        f"Start review ({len(self.prior_included)} included, "
                        f"{len(self.prior_excluded)} excluded)",
                        "Stop"
                    ]
                }
            ]
            action = prompt(question).get("action", "Stop")

            if action.startswith("Add papers"):
                self._papers_from_id()
            elif action.startswith("Find papers"):
                self._papers_from_finder()
            elif action.startswith("Stop"):
                raise KeyboardInterrupt
            elif action.startswith("Start review"):
                break

    def _prior_knowledge(self):
        """Create prior knowledge from arguments."""
        if self.prior_included is None:
            self.prior_included = []
        if self.prior_excluded is None:
            self.prior_excluded = []
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

    def _get_labels_paper(self, index, stat_str=None, ask_stop=True):
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

        def _interact():
            question = [
                {
                    'type': 'list',
                    'name': 'action',
                    'message': 'Include or Exclude?',
                    'default': 'Exclude',
                    'choices': [
                        'Exclude', 'Include', Separator(),
                        'Export', Separator(), 'Stop'
                    ],
                    'filter': lambda val: val.lower()
                }
            ]
            action = prompt(question).get("action", "stop")
            if action == "stop" and ask_stop:
                question = [
                    {
                        'type': 'confirm',
                        'message': "Are you sure you want to stop?",
                        'name': 'stop',
                        'default': 'false',
                    }
                ]
                stopping = prompt(question).get("stop", True)
                if stopping:
                    return None
                else:
                    return _interact()
            elif action == "export":
                self._export()
                return _interact()
            return action

        action = _interact()

        if action == "include":
            label = 1
        elif action == "exclude":
            label = 0
        else:
            label = None

        return label

    def train(self, *args, **kwargs):
        print(ASCII_TEA)
        super(ReviewOracle, self).train(*args, **kwargs)

    def review(self, *args, instant_save=True, **kwargs):
        super(ReviewOracle, self).review(*args, instant_save=instant_save,
                                         **kwargs)

    def _export(self):
        """Export the results to a csv file.

        Order of records is: [included, not reviewed (by proba), excluded]
        """
        question = [
            {
                'type': 'input',
                'name': 'file_name',
                'validate': lambda val: val.endswith((".csv", ".ris")),
                'message': 'Type file name for export ending with .csv or .ris'
            }
        ]
        try:
            file_name = prompt(question)["file_name"]
        except KeyError:
            return
        pred_proba = self.query_kwargs.get('pred_proba', None)
        pool_idx = np.delete(np.arange(len(self.y)), self.train_idx)
        if pred_proba is not None:
            proba_order = np.argsort(pred_proba[pool_idx, 1])
        else:
            proba_order = np.arange(len(pool_idx))
        train_zero = self.train_idx[np.where(self.y[self.train_idx] == 0)[0]]
        train_one = self.train_idx[np.where(self.y[self.train_idx] == 1)[0]]
        df_order = np.concatenate(
            (train_one, pool_idx[proba_order], train_zero), axis=None)
        assert len(df_order) == len(self.y)
        for i in range(len(self.y)):
            assert i in df_order
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
