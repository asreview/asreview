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


class ActiveLearner:
    """Active learner class

    The active learner class is a wrapper around a query strategy and a classifier.
    It is used to rank the instances of the feature matrix.

    The classifier is optional, if no classifier is provided, the active learner will
    only rank the instances based on the query strategy. This can be useful for example
    if you want random screening.

    Arguments
    ---------
    query_strategy: BaseQueryStrategy
        The query strategy to use.
    classifier: BaseTrainClassifier
        The classifier to use. Default is None.
    balance_strategy: BaseTrainClassifier
        The balance strategy to use. Default is None.

    Returns
    -------
    ActiveLearner:
        An active learner object.

    """

    def __init__(self, query_strategy, classifier=None, balance_strategy=None):
        self.query_strategy = query_strategy
        self.classifier = classifier
        self.balance_strategy = balance_strategy

    def train(self, X, y):
        """train the classifier to the data.

        Arguments
        ---------
        X: np.array
            The instances to fit.
        y: np.array
            The labels of the instances.
        """

        if self.classifier is not None:
            if self.balance_strategy is None:
                sample_weight = None
            else:
                sample_weight = self.balance_strategy.compute_sample_weight(self, y)
            self.classifier.fit(X, y, sample_weight=sample_weight)
        else:
            raise ValueError("No classifier provided")

    def rank(self, X):
        """Rank the instances in X.

        Arguments
        ---------
        X: np.array
            The instances to rank.

        Returns
        -------
        np.array:
            The ranking of the instances.
        """
        return self.query_strategy.query(self, X)

    def query(self, X, n):
        """Query the instances in X.

        Arguments
        ---------
        X: np.array
            The instances to query.

        Returns
        -------
        np.array:
            The instances to query.
        """
        return self.query_strategy.query(self, X)[:n]
