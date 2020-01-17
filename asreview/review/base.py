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

import os
from abc import ABC
from abc import abstractmethod

import dill
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.wrappers.scikit_learn import KerasClassifier

from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import NOT_AVAILABLE
from asreview.logging import open_logger
from asreview.models.nb import NBModel
from asreview.query_strategies.max import MaxQuery
from asreview.balance_strategies.simple import SimpleBalance
from asreview.query_strategies.random import RandomQuery


def get_pool_idx(X, train_idx):
    return np.delete(np.arange(X.shape[0]), train_idx, axis=0)


def _merge_prior_knowledge(included, excluded, return_labels=True):
    """Merge prior included and prior excluded."""

    if included is None:
        included = []
    if excluded is None:
        excluded = []

    prior_indices = np.array(np.append(included, excluded), dtype=np.int)

    if return_labels:
        prior_included_labels = np.ones((len(included),), dtype=int)
        prior_excluded_labels = np.zeros((len(excluded),), dtype=int)

        labels = np.concatenate([
            prior_included_labels,
            prior_excluded_labels
        ])
        return prior_indices, labels
    return prior_indices


class BaseReview(ABC):
    """Base class for Systematic Review"""

    def __init__(self,
                 X,
                 y=None,
                 model=None,
                 query_model=None,
                 balance_model=None,
                 n_papers=None,
                 n_instances=DEFAULT_N_INSTANCES,
                 n_queries=None,
                 prior_included=[],
                 prior_excluded=[],
                 log_file=None,
                 final_labels=None,
                 verbose=1):
        """ Initialize base class for systematic reviews.

        Arguments
        ---------
        X: np.array
            The feature matrix for the current dataset.
        y: np.array
            Labels of each paper, 1 for included, 0 for excluded.
            Can be set to None, to indicate inclusion data is not available.
        model: BaseModel
            Initialized model to fit the data during active learning.
            See asreview.models.utils.py for possible models.
        query_model: BaseQueryModel
            Initialized model to query new instances for review, such as random
            sampling or max sampling.
            See asreview.query_strategies.utils.py for query models.
        balance_model: BaseBalanceModel
            Initialized model to redistribute the training data during the
            active learning process. They might either resample or undersample
            specific papers.
        n_papers: int
            Number of papers to review during the active learning process,
            excluding the number of initial priors. To review all papers, set
            n_papers to None.
        n_instances: int
            Number of papers to query at each step in the active learning
            process.
        n_queries: int
            Number of steps/queries to perform. Set to None for no limit.
        prior_included: list
            List of papers (ids) that are included a priori.
        prior_excluded: list
            List of papers (ids) that are excluded a priori.
        log_file: str
            Path to log file.
        final_labels: np.array
            Final labels if we're using a two step inclusion process.
            For example, if at one step a paper is considered after reading the
            abstract and then at the second step, a final decision is made on
            the basis of the full text.
        """
        super(BaseReview, self).__init__()

        self.X = X
        self.y = y
        if y is None:
            self.y = np.full(X.shape[0], NOT_AVAILABLE)
        self.y = np.array(self.y, dtype=np.int)
        # Default to Naive Bayes model
        if model is None:
            model = NBModel()
        if query_model is None:
            query_model = MaxQuery()
        if balance_model is None:
            balance_model = SimpleBalance()

        self.model = model
        self.balance_model = balance_model
        self.query_model = query_model

        self.shared = {"query_src": {}, "current_queries": {}}
        self.model.shared = self.shared
        self.query_model.shared = self.shared
        self.balance_model.shared = self.shared

        self.n_papers = n_papers
        self.n_instances = n_instances
        self.n_queries = n_queries
        self.log_file = log_file
        self.verbose = verbose

        self.prior_included = prior_included
        self.prior_excluded = prior_excluded

        self.query_i = 0
        self.train_idx = np.array([], dtype=np.int)
        self.model_trained = False

        with open_logger(log_file) as logger:
            if not logger.is_empty():
                y, train_idx, query_src, query_i = logger.review_state()
                if X.shape[0] != len(y):
                    raise ValueError("The log file does not correspond to the "
                                     "given data file, please use another log "
                                     "file or dataset.")
                self.y = y
                self.train_idx = train_idx
                self.shared["query_src"] = query_src
                self.query_i = query_i
            else:
                if final_labels is not None:
                    logger.set_final_labels(final_labels)
                logger.set_labels(self.y)
                self._prior_knowledge(logger)
                self.query_i = 0

    def _prior_knowledge(self, logger):
        """Create prior knowledge from arguments."""
        if self.prior_included is not None and len(self.prior_included) > 0:
            self.classify(self.prior_included,
                          np.ones(len(self.prior_included)),
                          logger, method="initial")
        if self.prior_excluded is not None and len(self.prior_excluded) > 0:
            self.classify(self.prior_excluded,
                          np.zeros(len(self.prior_included)),
                          logger, method="initial")

    @abstractmethod
    def _get_labels(self, ind):
        """Classify the provided indices."""
        pass

    def _stop_iter(self, query_i, n_pool):
        """Criteria for stopping iteration.

        Stop iterating if:
            - n_queries is reached
            - the pool is empty
        """

        stop_iter = False
        n_train = self.X.shape[0] - n_pool

        # if the pool is empty, always stop
        if n_pool == 0:
            stop_iter = True

        # If we are exceeding the number of papers, stop.
        if self.n_papers is not None and n_train >= self.n_papers:
            stop_iter = True

        # don't stop if there is no stopping criteria
        if self.n_queries is not None and query_i >= self.n_queries:
            stop_iter = True

        return stop_iter

    def n_pool(self):
        return self.X.shape[0] - len(self.train_idx)

    def _next_n_instances(self):  # Could be merged with _stop_iter someday.
        """ Get the batch size for the next query. """
        n_instances = self.n_instances
        n_pool = self.n_pool()

        n_instances = min(n_instances, n_pool)
        if self.n_papers is not None:
            papers_left = self.n_papers - len(self.train_idx)
            n_instances = min(n_instances, papers_left)
        return n_instances

    def _do_review(self, logger, stop_after_class=True, instant_save=False):
        if self._stop_iter(self.query_i, self.n_pool()):
            return

        # train the algorithm with prior knowledge
        self.train()
        self.log_probabilities(logger)

        n_pool = self.X.shape[0] - len(self.train_idx)

        while not self._stop_iter(self.query_i-1, n_pool):
            # STEP 1: Make a new query
            query_idx = self.query(
                n_instances=self._next_n_instances()
            )

            # STEP 2: Classify the queried papers.
            if instant_save:
                for idx in query_idx:
                    idx_array = np.array([idx], dtype=np.int)
                    self.classify(idx_array, self._get_labels(idx_array),
                                  logger)
            else:
                self.classify(query_idx, self._get_labels(query_idx), logger)

            # Option to stop after the classification set instead of training.
            if (stop_after_class and
                    self._stop_iter(self.query_i, self.n_pool())):
                break

            # STEP 3: Train the algorithm with new data
            # Update the training data and pool afterwards
            self.train()
            self.log_probabilities(logger)

    def review(self, *args, **kwargs):
        """Do the systematic review, writing the results to the log file.

        Arguments
        ---------
        stop_after_class: bool
            When to stop; if True stop after classification step, otherwise
            stop after training step.
        instant_save: bool
            If True, save results after each single classification.
        """
        with open_logger(self.log_file) as logger:
            self._do_review(logger, *args, **kwargs)

    def log_probabilities(self, logger):
        """ Store the modeling probabilities of the training indices and
            pool indices. """
        if not self.model_trained:
            return

        pool_idx = get_pool_idx(self.X, self.train_idx)

        # Log the probabilities of samples in the pool being included.
        pred_proba = self.shared.get('pred_proba', np.array([]))
        if len(pred_proba) == 0:
            pred_proba = self.model.predict_proba(self.X)
            self.shared['perd_proba'] = pred_proba

        proba_1 = np.array([x[1] for x in pred_proba])
        logger.add_proba(pool_idx, self.train_idx, proba_1, self.query_i)

    def query(self, n_instances):
        """Query new results.

        Arguments
        ---------
        n_instances: int
            Batch size of the queries, i.e. number of papers to be queried.

        Returns
        -------
        np.array:
            Indices of papers queried.
        """

        pool_idx = get_pool_idx(self.X, self.train_idx)

        n_instances = min(n_instances, len(pool_idx))

        # If the model is not trained, choose random papers.
        if not self.model_trained:
            query_idx, _ = RandomQuery().query(
                self.X, None, pool_idx, n_instances=n_instances,
                shared=self.shared)

        else:
            # Make a query from the pool.
            query_idx, _ = self.query_model.query(
                X=self.X,
                classifier=self.model,
                pool_idx=pool_idx,
                n_instances=n_instances,
                shared=self.shared,
            )
        return query_idx

    def classify(self, query_idx, inclusions, logger, method=None):
        """ Classify new papers and update the training indices.

        It automaticaly updates the logger.

        Arguments
        ---------
        query_idx: list, np.array
            Indices to classify.
        inclusions: list, np.array
            Labels of the query_idx.
        logger: BaseLogger
            Logger to store the classification in.
        """
        query_idx = np.array(query_idx, dtype=np.int)
        self.y[query_idx] = inclusions
        query_idx = query_idx[np.isin(query_idx, self.train_idx, invert=True)]
        self.train_idx = np.append(self.train_idx, query_idx)
        if method is None:
            methods = []
            for idx in query_idx:
                method = self.shared["current_queries"].pop(idx, None)
                if method is None:
                    method = "unknown"
                methods.append(method)
                if method in self.shared["query_src"]:
                    self.shared["query_src"][method].append(idx)
                else:
                    self.shared["query_src"][method] = [idx]
        else:
            methods = np.full(len(query_idx), method)
            if method in self.shared["query_src"]:
                self.shared["query_src"][method].extend(
                    query_idx.tolist())
            else:
                self.shared["query_src"][method] = query_idx.tolist()

        logger.add_classification(query_idx, inclusions, methods=methods,
                                  query_i=self.query_i)
        logger.set_labels(self.y)

    def train(self):
        """ Train the model. """

        num_zero = np.count_nonzero(self.y[self.train_idx] == 0)
        num_one = np.count_nonzero(self.y[self.train_idx] == 1)
        if num_zero == 0 or num_one == 0:
            return

        # Get the training data.
        X_train, y_train = self.balance_model.sample(
            self.X, self.y, self.train_idx, shared=self.shared)

        # Train the model on the training data.
        self.model.fit(
            X=X_train,
            y=y_train,
        )
        self.shared["pred_proba"] = self.model.predict_proba(self.X)
        self.model_trained = True
        self.query_i += 1

    def statistics(self):
        "Get a number of statistics about the current state of the review."
        try:
            n_initial = len(self.shared['query_src']['initial'])
        except KeyError:
            n_initial = 0

        try:
            if np.count_nonzero(self.y[self.train_idx[n_initial:]] == 1) == 0:
                last_inclusion = len(self.train_idx[n_initial:])
            else:
                last_inclusion = np.nonzero(
                    self.y[self.train_idx[n_initial:]][::-1] == 1)[0][0]
        except ValueError:
            last_inclusion = 0

        stats = {
            "n_included": np.count_nonzero(self.y[self.train_idx] == 1),
            "n_excluded": np.count_nonzero(self.y[self.train_idx] == 0),
            "n_papers": len(self.y),
            "n_reviewed": len(self.train_idx),
            "n_pool": self.n_pool(),
            "last_inclusion": last_inclusion,
            "n_initial": n_initial,
        }
        return stats

    def save(self, pickle_fp):
        """
        Dump the self object to a pickle fill (using dill). Keras models
        Cannot be dumped, so they are written to a separate h5 file. The
        model is briefly popped out of the object to allow the rest to be
        written to a file. Do not rely on this method for long term storage
        of the class, since library changes could easily break it. In those
        cases, use the log + h5 file instead.
        """
        if isinstance(self.model, KerasClassifier) and self.model_trained:
            model_fp = os.path.splitext(pickle_fp)[0]+".h5"
            self.model.model.save(model_fp)
            current_model = self.model.__dict__.pop("model", None)
            with open(pickle_fp, "wb") as fp:
                dill.dump(self, fp)
            setattr(self.model, "model", current_model)
        else:
            dill.dump(self, fp)

    @classmethod
    def load(cls, pickle_fp):
        """
        Create a BaseReview object from a pickle file, and optiona h5 file.
        """
        with open(pickle_fp, "rb") as fp:
            my_instance = dill.load(fp)
        try:
            model_fp = os.path.splitext(pickle_fp)[0]+".h5"
            current_model = load_model(model_fp)
            setattr(my_instance.model, "model", current_model)
        except Exception:
            pass
        return my_instance
