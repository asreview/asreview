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

from abc import ABC
from abc import abstractmethod
import warnings

import numpy as np

from asreview.config import DEFAULT_N_INSTANCES, LABEL_NA
from asreview.state.utils import open_state
from asreview.models.nb import NBModel
from asreview.query_strategies.max import MaxQuery
from asreview.balance_strategies.simple import SimpleBalance
from asreview.query_strategies.random import RandomQuery
from asreview.settings import ASReviewSettings
from asreview.feature_extraction.tfidf import Tfidf


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
    name = "base"

    def __init__(self,
                 as_data,
                 model=None,
                 query_model=None,
                 balance_model=None,
                 feature_model=None,
                 n_papers=None,
                 n_instances=DEFAULT_N_INSTANCES,
                 n_queries=None,
                 start_idx=[],
                 state_file=None,
                 log_file=None,
#                  final_labels=None,
                 verbose=1,
                 data_fp=None,
                 ):
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
        state_file: str
            Path to state file. Replaces log_file argument.
        final_labels: np.array
            Final labels if we're using a two step inclusion process.
            For example, if at one step a paper is considered after reading the
            abstract and then at the second step, a final decision is made on
            the basis of the full text.
        """
        super(BaseReview, self).__init__()

        # Default to Naive Bayes model
        if model is None:
            model = NBModel()
        if query_model is None:
            query_model = MaxQuery()
        if balance_model is None:
            balance_model = SimpleBalance()
        if feature_model is None:
            feature_model = Tfidf()

        self.as_data = as_data
        self.y = as_data.labels
        if self.y is None:
            self.y = np.full(len(as_data), LABEL_NA)
        self.model = model
        self.balance_model = balance_model
        self.query_model = query_model
        self.feature_model = feature_model

        self.shared = {"query_src": {}, "current_queries": {}}
        self.model.shared = self.shared
        self.query_model.shared = self.shared
        self.balance_model.shared = self.shared

        self.n_papers = n_papers
        self.n_instances = n_instances
        self.n_queries = n_queries

        if log_file is not None:
            warnings.warn("The log_file argument for BaseReview will be"
                          " replaced by state_file.", category=FutureWarning)
            self.state_file = log_file
        else:
            self.state_file = state_file
        self.verbose = verbose

        self.query_i = 0
        self.query_i_classified = 0
        self.train_idx = np.array([], dtype=np.int)
        self.model_trained = False
        self.data_fp = data_fp

        with open_state(self.state_file) as state:
            if not state.is_empty():
                startup = state.startup_vals()
                if not set(startup["train_idx"]) >= set(start_idx):
                    new_idx = list(set(start_idx)-set(startup["train_idx"]))
                    self.classify(new_idx, self.y[new_idx], state,
                                  method="initial")
                    startup = state.startup_vals()
                self.train_idx = startup["train_idx"]
                self.y = startup["labels"]
                self.shared["query_src"] = startup["query_src"]
                self.query_i = startup["query_i"]
                self.query_i_classified = startup["query_i_classified"]
            else:
                state.set_labels(self.y)
                state.settings = self.settings
                self.classify(start_idx, self.y[start_idx], state,
                              method="initial")
                self.query_i_classified = len(start_idx)

            try:
                self.X = state.get_feature_matrix(as_data.hash())
            except KeyError:
                self.X = feature_model.fit_transform(
                    as_data.texts, as_data.headings, as_data.bodies,
                    as_data.keywords)
                state._add_as_data(as_data, feature_matrix=self.X)
            if self.X.shape[0] != len(self.y):
                raise ValueError("The state file does not correspond to the "
                                 "given data file, please use another state "
                                 "file or dataset.")
            self.load_current_query(state)

    @property
    def settings(self):
        extra_kwargs = {}
        if hasattr(self, 'n_prior_included'):
            extra_kwargs['n_prior_included'] = self.n_prior_included
        if hasattr(self, 'n_prior_excluded'):
            extra_kwargs['n_prior_excluded'] = self.n_prior_excluded
        return ASReviewSettings(
            mode=self.name, model=self.model.name,
            query_strategy=self.query_model.name,
            balance_strategy=self.balance_model.name,
            feature_extraction=self.feature_model.name,
            n_instances=self.n_instances,
            n_queries=self.n_queries,
            n_papers=self.n_papers,
            model_param=self.model.param,
            query_param=self.query_model.param,
            balance_param=self.balance_model.param,
            feature_param=self.feature_model.param,
            data_name=self.as_data.data_name,
            **extra_kwargs)

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
        """Get the batch size for the next query."""
        n_instances = self.n_instances
        n_pool = self.n_pool()

        n_instances = min(n_instances, n_pool)
        if self.n_papers is not None:
            papers_left = self.n_papers - len(self.train_idx)
            n_instances = min(n_instances, papers_left)
        return n_instances

    def _do_review(self, state, stop_after_class=True, instant_save=False):
        if self._stop_iter(self.query_i, self.n_pool()):
            return

        # train the algorithm with prior knowledge
        self.train()
        self.log_probabilities(state)

        n_pool = self.X.shape[0] - len(self.train_idx)

        while not self._stop_iter(self.query_i-1, n_pool):
            # STEP 1: Make a new query
            query_idx = self.query(
                n_instances=self._next_n_instances()
            )
            self.log_current_query(state)

            # STEP 2: Classify the queried papers.
            if instant_save:
                for idx in query_idx:
                    idx_array = np.array([idx], dtype=np.int)
                    self.classify(idx_array, self._get_labels(idx_array),
                                  state)
                    self.query_i_classified += 1
            else:
                self.classify(query_idx, self._get_labels(query_idx), state)
                self.query_i_classified += len(query_idx)

            # Option to stop after the classification set instead of training.
            if (stop_after_class and
                    self._stop_iter(self.query_i, self.n_pool())):
                break

            # STEP 3: Train the algorithm with new data
            # Update the training data and pool afterwards
            self.train()
            self.log_probabilities(state)

    def review(self, *args, **kwargs):
        """Do the systematic review, writing the results to the state file.

        Arguments
        ---------
        stop_after_class: bool
            When to stop; if True stop after classification step, otherwise
            stop after training step.
        instant_save: bool
            If True, save results after each single classification.
        """
        with open_state(self.state_file) as state:
            self._do_review(state, *args, **kwargs)

    def log_probabilities(self, state):
        """Store the modeling probabilities of the training indices and
           pool indices."""
        if not self.model_trained:
            return

        pool_idx = get_pool_idx(self.X, self.train_idx)

        # Log the probabilities of samples in the pool being included.
        pred_proba = self.shared.get('pred_proba', np.array([]))
        if len(pred_proba) == 0:
            pred_proba = self.model.predict_proba(self.X)
            self.shared['pred_proba'] = pred_proba

        proba_1 = np.array([x[1] for x in pred_proba])
        state.add_proba(pool_idx, self.train_idx, proba_1, self.query_i)

    def log_current_query(self, state):
        state.set_current_queries(self.shared["current_queries"])

    def load_current_query(self, state):
        try:
            self.shared["current_queries"] = state.get_current_queries()
        except KeyError:
            self.shared["current_queries"] = {}

    def query(self, n_instances, query_model=None):
        """Query new results.

        Arguments
        ---------
        n_instances: int
            Batch size of the queries, i.e. number of papers to be queried.
        query_model: BaseQueryModel
            Query strategy model to use. If None, the query model of the
            reviewer is used.

        Returns
        -------
        np.array:
            Indices of papers queried.
        """

        pool_idx = get_pool_idx(self.X, self.train_idx)

        n_instances = min(n_instances, len(pool_idx))

        # If the model is not trained, choose random papers.
        if not self.model_trained and query_model is None:
            query_model = RandomQuery()
        if not self.model_trained:
            classifier = None
        else:
            classifier = self.model
        if query_model is None:
            query_model = self.query_model

        # Make a query from the pool.
        query_idx, _ = query_model.query(
            X=self.X,
            classifier=classifier,
            pool_idx=pool_idx,
            n_instances=n_instances,
            shared=self.shared,
        )
        return query_idx

    def classify(self, query_idx, inclusions, state, method=None):
        """ Classify new papers and update the training indices.

        It automaticaly updates the state.

        Arguments
        ---------
        query_idx: list, np.array
            Indices to classify.
        inclusions: list, np.array
            Labels of the query_idx.
        state: BaseLogger
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

        state.add_classification(query_idx, inclusions, methods=methods,
                                 query_i=self.query_i)
        state.set_labels(self.y)

    def train(self):
        """Train the model."""

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
        if self.query_i_classified > 0:
            self.query_i += 1
            self.query_i_classified = 0

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

#     def save(self, pickle_fp):
#         """Dump the self object to a pickle fill (using dill).
# 
#         Keras models cannot be dumped, so they are written to a separate
#         h5 file. The model is briefly popped out of the object to allow the
#         rest to be written to a file. Do not rely on this method for long term
#         storage of the class, since library changes could easily break it.
#         In those cases, use the state + h5 file instead.
#         """
#         if isinstance(self.model, KerasClassifier) and self.model_trained:
#             model_fp = os.path.splitext(pickle_fp)[0]+".h5"
#             self.model.model.save(model_fp)
#             current_model = self.model.__dict__.pop("model", None)
#             with open(pickle_fp, "wb") as fp:
#                 dill.dump(self, fp)
#             setattr(self.model, "model", current_model)
#         else:
#             dill.dump(self, fp)
# 
#     @classmethod
#     def load(cls, pickle_fp):
#         """
#         Create a BaseReview object from a pickle file.
#         """
#         with open(pickle_fp, "rb") as fp:
#             my_instance = dill.load(fp)
#         try:
#             model_fp = os.path.splitext(pickle_fp)[0]+".h5"
#             current_model = load_model(model_fp)
#             setattr(my_instance.model, "model", current_model)
#         except Exception:
#             pass
#         return my_instance
