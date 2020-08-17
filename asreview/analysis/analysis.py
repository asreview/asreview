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

import itertools
import os
from pathlib import Path

import numpy as np
from scipy import stats

from asreview.state.utils import states_from_dir, state_from_file
from asreview.analysis.statistics import _get_labeled_order
from asreview.analysis.statistics import _get_limits
from asreview.analysis.statistics import _find_inclusions
from asreview.analysis.statistics import _get_last_proba_order


class Analysis():
    """Analysis object to do statistical analysis on state files."""

    def __init__(self, states, key=None):
        """Class to analyse state files.

        Arguments
        ---------
        states: list, BaseLogger
            Either a list of states (opened files) or a single state.
        key: str
            Give a name to the analysis.
        """
        if isinstance(states, list):
            states = {i: state for i, state in enumerate(states)}

        # Sometimes an extra dataset is present in the state_file(s).
        # These signify not the labels on which the model was trained, but the
        # ones that were included in the end (or some other intermediate step.
        self.final_labels = None
        self.labels = None
        self.empty = True

        if states is None:
            return

        self.key = key
        self.states = states
        self.num_runs = len(self.states)
        if self.num_runs == 0:
            return

        self._first_file = list(self.states.keys())[0]
        self.labels = self.states[self._first_file].get('labels')
        try:
            self.final_labels = self.states[self._first_file].get(
                'final_labels')
        except KeyError:
            pass
        self.empty = False
        self.inc_found = {}

    @classmethod
    def from_dir(cls, data_dir, prefix="", key=None):
        """Create an Analysis object from a directory.

        Arguments
        ---------
        data_dir: str
            Directory to read the state files from.
        prefix: str
            Only assume files starting with this prefix are state files.
            Ignore all other files.
        key: str
            Name for the analysis object.
        """
        if key is None:
            key = os.path.basename(os.path.normpath(data_dir))
        states = states_from_dir(data_dir, prefix=prefix)
        analysis_inst = cls(states, key=key)
        if analysis_inst.empty:
            return None

        analysis_inst.data_dir = data_dir
        return analysis_inst

    @classmethod
    def from_file(cls, data_fp, key=None):
        """Create an Analysis object from a file.

        Arguments
        ---------
        data_fp: str
            Path to state file to analyse.
        key: str
            Name for analysis object.
        """
        if key is None:
            key = os.path.basename(os.path.normpath(data_fp))
        state = state_from_file(data_fp)
        analysis_inst = cls(state, key=key)
        if analysis_inst.empty:
            return None

        analysis_inst.data_path = data_fp
        return analysis_inst

    @classmethod
    def from_path(cls, data_path, prefix="", key=None):
        """Create an Analysis object from either a file or a directory."""
        if Path(data_path).is_file():
            return cls.from_file(data_path, key=key)
        return cls.from_dir(data_path, prefix, key=key)

    def inclusions_found(self,
                         result_format="fraction",
                         final_labels=False,
                         **kwargs):
        """Get the number of inclusions at each point in time.

        Caching is used to prevent multiple calls being expensive.

        Arguments
        ---------
        result_format: str
            The format % or # of the returned values.
        final_labels: bool
            If true, use the final_labels instead of labels for analysis.

        Returns
        -------
        tuple:
            Three numpy arrays with x, y, error_bar.
        """
        if final_labels:
            labels = self.final_labels
        else:
            labels = self.labels

        fl = final_labels
        if fl not in self.inc_found:
            # Compute the comclusions if not found in cache.
            self.inc_found[fl] = {}
            avg, err, iai, ninit = self._get_inc_found(
                labels=labels, **kwargs
            )
            self.inc_found[fl]["avg"] = avg
            self.inc_found[fl]["err"] = err
            self.inc_found[fl]["inc_after_init"] = iai
            self.inc_found[fl]["n_initial"] = ninit
        dx = 0
        dy = 0
        x_norm = len(labels) - self.inc_found[fl]["n_initial"]
        y_norm = self.inc_found[fl]["inc_after_init"]

        if result_format == "percentage":
            x_norm /= 100
            y_norm /= 100
        elif result_format == "number":
            x_norm /= len(labels)
            y_norm /= self.inc_found[fl]["inc_after_init"]

        norm_xr = (np.arange(1, len(self.inc_found[fl]["avg"])+1) - dx) / x_norm
        norm_yr = (np.array(self.inc_found[fl]["avg"]) - dy) / y_norm
        norm_y_err = np.array(self.inc_found[fl]["err"]) / y_norm

        return norm_xr, norm_yr, norm_y_err

    def _get_inc_found(self, labels=False):
        """Get the number of inclusions (without formatting)."""
        inclusions_found = []

        for state in self.states.values():
            inclusions, inc_after_init, n_initial = _find_inclusions(
                state, labels)
            inclusions_found.append(inclusions)

        inc_found_avg = []
        inc_found_err = []
        for i_instance in itertools.count():
            cur_vals = []
            for i_file in range(self.num_runs):
                try:
                    cur_vals.append(inclusions_found[i_file][i_instance])
                except IndexError:
                    pass
            if len(cur_vals) == 0:
                break
            if len(cur_vals) == 1:
                err = cur_vals[0]
            else:
                err = stats.sem(cur_vals)
            avg = np.mean(cur_vals)
            inc_found_avg.append(avg)
            inc_found_err.append(err)

        if self.num_runs == 1:
            inc_found_err = np.zeros(len(inc_found_err))

        return inc_found_avg, inc_found_err, inc_after_init, n_initial

    def wss(self, val=100, x_format="percentage", **kwargs):
        """Get the WSS (Work Saved Sampled) value.

        Arguments
        ---------
        val:
            At which recall, between 0 and 100.
        x_format:
            Format for position of WSS value in graph.

        Returns
        -------
        tuple:
            Tuple consisting of WSS value, x_positions, y_positions of WSS bar.
        """
        norm_xr, norm_yr, _ = self.inclusions_found(
            result_format="percentage", **kwargs)

        if x_format == "number":
            x_return, y_result, _ = self.inclusions_found(
                result_format="number", **kwargs)
            y_max = self.inc_found[False]["inc_after_init"]
            y_coef = y_max / (
                len(self.labels) - self.inc_found[False]["n_initial"])
        else:
            x_return = norm_xr
            y_result = norm_yr
            y_max = 1.0
            y_coef = 1.0

        for i in range(len(norm_yr)):
            if norm_yr[i] >= val - 1e-6:
                return (norm_yr[i] - norm_xr[i], (x_return[i], x_return[i]),
                        (x_return[i] * y_coef, y_result[i]))
        return (None, None, None)

    def rrf(self, val=10, x_format="percentage", **kwargs):
        """Get the RRF (Relevant References Found).

        Arguments
        ---------
        val:
            At which recall, between 0 and 100.
        x_format:
            Format for position of RRF value in graph.

        Returns
        -------
        tuple:
            Tuple consisting of RRF value, x_positions, y_positions of RRF bar.

        """
        norm_xr, norm_yr, _ = self.inclusions_found(
            result_format="percentage", **kwargs)

        if x_format == "number":
            x_return, y_return, _ = self.inclusions_found(
                result_format="number", **kwargs)
        else:
            x_return = norm_xr
            y_return = norm_yr

        for i in range(len(norm_yr)):
            if norm_xr[i] >= val - 1e-6:
                return (norm_yr[i], (x_return[i], x_return[i]), (0,
                                                                 y_return[i]))
        return (None, None, None)

    def avg_time_to_discovery(self, result_format="number"):
        """Get the best/last estimate on how long it takes to find a paper, the Time to Discovery (TD).

        Returns
        -------
        dict:
            For each inclusion, key=paper_id, value=avg time.
        """
        labels = self.labels

        # inclusions (ones)
        one_labels = np.where(labels == 1)[0]
        # store discovery time
        time_results = {label: [] for label in one_labels}

        # for every state file
        for state in self.states.values():
            # get the order in which records were labeled
            label_order, n = _get_labeled_order(state)
            # get the ranking of all papers at the last query
            proba_order = _get_last_proba_order(state)

            # get factor to account for total number of publications to label
            if result_format == "percentage":
                time_mult = 100 / (len(labels) - n)
            elif result_format == "fraction":
                time_mult = 1/(len(labels) - n)
            else:
                time_mult = 1


            # get the time to discovery
            for i_time, idx in enumerate(label_order[n:]):
                # for all inclusions that were found/labeled
                if labels[idx] == 1:
                    time_results[idx].append(time_mult*(i_time+1))
            for i_time, idx in enumerate(proba_order):
                # for all inclusions that weren't found/labeled
                if labels[idx] == 1 and idx not in label_order[:n]:
                    time_results[idx].append(
                        time_mult*(i_time + len(label_order)+1))

        results = {}

        # time to discovery averaged over all state files
        for label, trained_time in time_results.items():
            if len(trained_time) > 0:
                results[label] = np.average(trained_time)

        return results

    def limits(self, prob_allow_miss=[0.1], result_format="percentage"):
        """For each query, compute the number of papers for a criterium.

        A criterium is the average number of papers missed. For example,
        with 0.1, the criterium is that after reading x papers, there is
        (about) a 10% chance that one paper is not included. Another example,
        with 2.0, there are on average 2 papers missed after reading x papers.
        The value for x is returned for each query and probability by the
        function.

        Arguments
        ---------
        prob_allow_miss: list, float
            Sets the criterium for how many papers can be missed.

        returns
        -------
        dict:
            One entry, "x_range" with the number of papers read.
            List, "limits" of results for each probability and
            at # papers read.
        """
        if not isinstance(prob_allow_miss, list):
            prob_allow_miss = [prob_allow_miss]
        state = self.states[self._first_file]
        n_queries = state.n_queries()
        results = {
            "x_range": [],
            "limits": [[] for _ in range(len(prob_allow_miss))],
        }

        n_train = 0
        _, n_initial = _get_labeled_order(state)
        for query_i in range(n_queries):
            new_limits = _get_limits(
                self.states,
                query_i,
                self.labels,
                proba_allow_miss=prob_allow_miss)

            try:
                new_train_idx = state.get("train_idx", query_i)
            except KeyError:
                new_train_idx = None

            if new_train_idx is not None:
                n_train = len(new_train_idx)

            if new_limits is not None:
                if result_format == "percentage":
                    normalizer = 100 / (len(self.labels) - n_initial)
                else:
                    normalizer = 1
                results["x_range"].append((n_train - n_initial) * normalizer)
                for i_prob in range(len(prob_allow_miss)):
                    results["limits"][i_prob].append(
                        (new_limits[i_prob] - n_initial) * normalizer)

        if result_format == "percentage":
            res_dtype = np.float
        else:
            res_dtype = np.int

        results["x_range"] = np.array(results["x_range"], dtype=res_dtype)
        for i_prob in range(len(prob_allow_miss)):
            results["limits"][i_prob] = np.array(results["limits"][i_prob],
                                                 res_dtype)
        return results

    def close(self):
        """Close states."""
        for state in self.states.values():
            state.close()
