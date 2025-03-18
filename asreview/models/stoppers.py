# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

"""Stopper mechanisms for the review process.

The stopper mechanisms determine when the review process should be stopped.
This can be based on the properties of the results table or the input dataset.


.. warning::
    This module is experimental and might change.

"""

import pandas as pd

from sklearn.base import BaseEstimator

__all__ = [
    "LastRelevant",
    "NLabeled",
    "QuantileLabeled",
    "IsFittable",
    "NConsecutiveIrrelevant",
]


def safe_stop(stop_method):
    """Decorator to ensure safe stopping conditions."""

    def wrapper(self, results, data):
        if len(data) == 0:
            return True
        if len(results) == len(data):
            return True
        return stop_method(self, results, data)

    return wrapper


def raise_if_not_simulate(stop_method):
    """Decorator to only use the stopping mechanism in simulation."""

    def wrapper(self, results, data):
        if isinstance(data, (pd.DataFrame, pd.Series)):
            data_check = data
        else:
            data_check = pd.Series(data)

        if data_check.isna().any():
            raise ValueError("Stopper mechanism requires all data to be labeled.")

        return stop_method(self, results, data)

    return wrapper


class LastRelevant(BaseEstimator):
    """Stop after last relevant record.

    The stopping mechanism stops the review when all records have been
    labeled.

    Arguments
    ---------
    value: int, str
        Number of labels to stop the review at. If set to "min", the review will
        stop when all relevant records are found.
    """

    name = "last_relevant"
    label = "Last Relevant"

    @safe_stop
    @raise_if_not_simulate
    def stop(self, results, data):
        """Check if the review should be stopped.

        This function checks if the review should be stopped based on the results
        and the labels of the papers.

        Arguments
        ---------
        results: pandas.DataFrame
            DataFrame with the results of the review.
        data: pandas.DataFrame, list, np.array
            pandas.DataFrame, list, np.array with all records. Used to determine
            number of all records in data.

        Returns
        -------
        bool:
            True if the review should be stopped, False otherwise.
        """

        if sum(data) == sum(results["label"]):
            return True

        return False


class NLabeled(BaseEstimator):
    """Stop the review after n have been labeled.

    Arguments
    ---------
    n: int, tuple
        Number of labels to stop the review at. If tuple, the first element is
        the number of relevant records to find, the second element is the number
        of irrelevant records to find.
    """

    name = "n_labeled"
    label = "N Labeled"

    def __init__(self, n):
        self.n = n

    @safe_stop
    def stop(self, results, data):
        """Check if the review should be stopped.

        This function checks if the review should be stopped based on the results
        and the labels of the papers.

        Arguments
        ---------
        results: pandas.DataFrame
            DataFrame with the results of the review.
        data: pandas.DataFrame, list, np.array
            pandas.DataFrame, list, np.array with all records. Used to determine
            number of all records in data.

        Returns
        -------
        bool:
            True if the review should be stopped, False otherwise.
        """

        if not isinstance(self.n, (int, tuple)):
            raise ValueError("StopperN requires an integer or a tuple of integers")

        if self.n == -1:
            return False

        if isinstance(self.n, int) and len(results) >= self.n:
            return True

        if isinstance(self.n, tuple):
            n_relevant, n_irrelevant = self.n
            if (
                sum(results["label"] == 1) >= n_relevant
                and sum(results["label"] == 0) >= n_irrelevant
            ):
                return True

        return False


class QuantileLabeled(BaseEstimator):
    """Stop the review after a certain quantile of the records have been labeled.

    Arguments
    ---------
    quantile: float
        Quantile of records to label before stopping the review.
    """

    name = "q_labeled"
    label = "Quantile Labeled"

    def __init__(self, quantile):
        self.quantile = quantile

    @safe_stop
    def stop(self, results, data):
        """Check if the review should be stopped.

        This function checks if the review should be stopped based on the results
        and the labels of the papers.

        Arguments
        ---------
        results: pandas.DataFrame
            DataFrame with the results of the review.
        data: pandas.DataFrame, list, np.array
            pandas.DataFrame, list, np.array with all records. Used to determine
            number of all records in data.

        Returns
        -------
        bool:
            True if the review should be stopped, False otherwise.
        """

        # Stop when reaching quantile (if provided)
        if len(results) / len(data) >= self.quantile:
            return True

        return False


class IsFittable(NLabeled):
    """Stop the review after both classes are found."""

    name = "is_fittable"
    label = "Is Fittable"

    def __init__(self):
        super().__init__(n=(1, 1))


class NConsecutiveIrrelevant(BaseEstimator):
    """Stop the review after n irrelevant records have been labeled in a row.

    Arguments
    ---------
    n: int
        Number of irrelevant records in a row to stop the review at.
    """

    name = "n_consecutive_irrelevant"
    label = "N Consecutive Irrelevant"

    def __init__(self, n):
        self.n = n

    @safe_stop
    def stop(self, results, data):
        """Check if the review cycle should be stopped.

        This function checks if the review cycle should be stopped based on the results
        and the labels of the papers.

        Arguments
        ---------
        results: pandas.DataFrame
            DataFrame with the results of the review.
        data: pandas.DataFrame, list, np.array
            pandas.DataFrame, list, np.array with all records. Used to determine
            number of all records in data.

        Returns
        -------
        bool:
            True if the review should be stopped, False otherwise.
        """

        if len(results) > self.n and sum(results["label"].iloc[-self.n :]) == 0:
            return True

        return False
