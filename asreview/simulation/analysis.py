'''
Analysis and reading of log files.

Merged versions of functions work on the results of all files at the same time.
'''

import itertools
import os
import numpy as np
from scipy import stats

from asreview.simulation.readers import get_loggers
from asreview.simulation.statistics import _get_labeled_order
from asreview.simulation.statistics import _get_limits
from asreview.simulation.statistics import _find_inclusions
from asreview.simulation.statistics import _get_last_proba_order


class Analysis():
    """ Analysis object to plot things from the logs. """
    def __init__(self, loggers, key=None):
        if isinstance(loggers, list):
            loggers = {i: logger for i, logger in enumerate(loggers)}

        self.labels = None
        self.final_labels = None
        self.empty = True

        self.key = key
        self.loggers = loggers
        self.num_runs = len(self.loggers)
        if self.num_runs == 0:
            return

        self._first_file = list(self.loggers.keys())[0]
        self.labels = self.loggers[self._first_file].get('labels')
        try:
            self.final_labels = self.loggers[self._first_file].get('final_labels')
        except KeyError:
            pass
        self.empty = False
        self.inc_found = {}

    @classmethod
    def from_dir(cls, data_dir):
        key = os.path.basename(os.path.normpath(data_dir))
        loggers = get_loggers(data_dir)
        analysis_inst = Analysis(loggers, key=key)
        if analysis_inst.empty:
            return None
        analysis_inst.data_dir = data_dir

        return analysis_inst

    def inclusions_found(self, result_format="fraction", final_labels=False,
                         **kwargs):
        if final_labels:
            labels = self.final_labels
        else:
            labels = self.labels

        fl = final_labels
        if fl not in self.inc_found:
            self.inc_found[fl] = {}
            avg, err, iai, ninit = self.get_inc_found(**kwargs, labels=labels)
            self.inc_found[fl]["avg"] = avg
            self.inc_found[fl]["err"] = err
            self.inc_found[fl]["inc_after_init"] = iai
            self.inc_found[fl]["n_initial"] = ninit
        dx = 0
        dy = 0
        x_norm = len(labels)-self.inc_found[fl]["n_initial"]
        y_norm = self.inc_found[fl]["inc_after_init"]

        if result_format == "percentage":
            x_norm /= 100
            y_norm /= 100
        elif result_format == "number":
            x_norm /= len(labels)
            y_norm /= self.inc_found[fl]["inc_after_init"]

        norm_xr = (np.arange(len(self.inc_found[fl]["avg"]))-dx)/x_norm
        norm_yr = (np.array(self.inc_found[fl]["avg"])-dy)/y_norm
        norm_y_err = np.array(self.inc_found[fl]["err"])/y_norm

        return norm_xr, norm_yr, norm_y_err

    def get_inc_found(self, labels=False):
        inclusions_found = []

        for logger in self.loggers.values():
            inclusions, inc_after_init, n_initial = _find_inclusions(
                logger, labels)
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

    def WSS(self, val=100, x_format="percentage", **kwargs):
        norm_xr, norm_yr, _ = self.inclusions_found(
            result_format="percentage", **kwargs)

        if x_format == "number":
            x_return, y_result, _ = self.inclusions_found(
                result_format="number", **kwargs)
            y_max = self.inc_found[False]["inc_after_init"]
            y_coef = y_max/(len(self.labels) -
                            self.inc_found[False]["n_initial"])
        else:
            x_return = norm_xr
            y_result = norm_yr
            y_max = 1.0
            y_coef = 1.0

        for i in range(len(norm_yr)):
            if norm_yr[i] >= val - 1e-6:
                return (norm_yr[i] - norm_xr[i],
                        (x_return[i], x_return[i]),
                        (x_return[i]*y_coef, y_result[i]))
        return (None, None, None)

    def RRF(self, val=10, x_format="percentage", **kwargs):
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
                return (norm_yr[i],
                        (x_return[i], x_return[i]),
                        (0, y_return[i]))
        return None

    def avg_time_to_discovery(self):
        labels = self.labels

        one_labels = np.where(labels == 1)[0]
        time_results = {label: [] for label in one_labels}
        n_initial = []

        for i_file, logger in enumerate(self.loggers.values()):
            label_order, n = _get_labeled_order(logger)
            proba_order = _get_last_proba_order(logger)
            n_initial.append(n)

            for i_time, idx in enumerate(label_order):
                if labels[idx] == 1:
                    time_results[idx].append(i_time)

            for i_time, idx in enumerate(proba_order):
                if labels[idx] == 1 and len(time_results[idx]) <= i_file:
                    time_results[idx].append(i_time + len(label_order))

            for idx in time_results:
                if len(time_results[idx]) <= i_file:
                    time_results[idx].append(
                        len(label_order) + len(proba_order))

        results = {}
        for label in time_results:
            trained_time = []
            for i_file, time in enumerate(time_results[label]):
                if time >= n_initial[i_file]:
                    trained_time.append(time)
            if len(trained_time) == 0:
                results[label] = 0
            else:
                results[label] = np.average(trained_time)
        return results

    def limits(self, prob_allow_miss=[0.1]):
        logger = self.loggers[self._first_file]
        n_queries = logger.n_queries()
        results = {
            "x_range": [],
            "limits": [[] for _ in range(len(prob_allow_miss))],
        }

        n_train = 0
        for query_i in range(n_queries):
            new_limits = _get_limits(self.loggers, query_i, self.labels,
                                     proba_allow_miss=prob_allow_miss)

            try:
                new_train_idx = logger.get("train_idx", query_i)
            except KeyError:
                new_train_idx = None

            if new_train_idx is not None:
                n_train = len(new_train_idx)

            if new_limits is not None:
                results["x_range"].append(n_train)
                for i_prob in range(len(prob_allow_miss)):
                    results["limits"][i_prob].append(new_limits[i_prob])

        results["x_range"] = np.array(results["x_range"], dtype=np.int)
        for i_prob in range(len(prob_allow_miss)):
            results["limits"][i_prob] = np.array(
                results["limits"][i_prob], np.int)
        return results

    def close(self):
        for logger in self.loggers.values():
            logger.close()
