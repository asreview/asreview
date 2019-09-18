import os
from abc import ABC, abstractmethod


from modAL.models import ActiveLearner
from tensorflow.python.keras.models import load_model
import numpy as np
import dill

from asreview.logging import Logger, query_key
from asreview.balance_strategies import full_sample
from asreview.query_strategies import max_sampling
from asreview.config import NOT_AVAILABLE


def get_pool_idx(X, train_idx):
    return np.delete(np.arange(X.shape[0]), train_idx, axis=0)


def _merge_prior_knowledge(included, excluded, return_labels=True):
    """Merge prior included and prior excluded."""

    prior_indices = np.append(included, excluded)

    if return_labels:

        prior_included_labels = np.ones((len(included),), dtype=int)
        prior_excluded_labels = np.zeros((len(excluded),), dtype=int)

        labels = np.concatenate([
            prior_included_labels,
            prior_excluded_labels
        ])

        return prior_indices, labels
    else:
        return prior_indices


class BaseReview(ABC):
    """Base class for Systematic Review"""

    def __init__(self,
                 X,
                 y=None,
                 model=None,
                 query_strategy=max_sampling,
                 train_data_fn=full_sample,
                 n_instances=1,
                 n_queries=1,
                 prior_included=[],
                 prior_excluded=[],
                 log_file=None,
                 fit_kwargs={},
                 balance_kwargs={},
                 query_kwargs={},
                 logger=None,
                 verbose=1):
        super(BaseReview, self).__init__()

        self.X = X
        self.y = y
        if y is None:
            self.y = np.full(X.shape[0], NOT_AVAILABLE)

        # Default to Naive Bayes model
        if model is None:
            print("Warning: using naive Bayes model as default."
                  "If you experience bad performance, read the documentation"
                  " in order to implement a RNN based solution.")
            from asreview.models import create_nb_model
            model = create_nb_model()

        self.model = model
        self.query_strategy = query_strategy
        self.train_data = train_data_fn

        self.n_instances = n_instances
        self.n_queries = n_queries
        self.log_file = log_file
        self.verbose = verbose

        self.prior_included = prior_included
        self.prior_excluded = prior_excluded

        self.fit_kwargs = fit_kwargs
        self.balance_kwargs = balance_kwargs
        self.query_kwargs = query_kwargs

        self.query_i = 0
        self.train_idx = np.array([], dtype=np.int)
        self.model_trained = False

        self.query_kwargs["src_query_idx"] = {}

        if logger is None:
            self._logger = Logger()
            self.start_from_logger = False
        else:
            self._logger = logger
            self._prepare_with_logger()
            self.start_from_logger = True

        # Initialize learner, but don't start training yet.
        self.learner = ActiveLearner(
            estimator=self.model,
            query_strategy=self.query_strategy
        )
        print(self.train_idx.dtype)

    @classmethod
    def from_logger(cls, *args, **kwargs):
        reviewer = cls(*args, **kwargs)
        reviewer._prepare_with_logger()
        return reviewer

    @abstractmethod
    def _prior_knowledge(self):
        pass

    @abstractmethod
    def _get_labels(self, ind):
        """Classify the provided indices."""
        pass

    def _prior_teach(self):
        """Function called before training model."""

        pass

    def _stop_iter(self, query_i, n_pool):
        """Criteria for stopping iteration.

        Stop iterating if:
            - n_queries is reached
            - the pool is empty
        """

        stop_iter = False

        # if the pool is empty, always stop
        if n_pool == 0:
            stop_iter = True

        # don't stop if there is no stopping criteria
        if self.n_queries is not None and query_i >= self.n_queries:
            stop_iter = True

        return stop_iter

    def _prepare_with_logger(self):
        """ If we start the reviewer from a log file, we need to do some
            preparation work. The final result should be a log dictionary in
            a state where the labeled papares are one step ahead of the
            probabilities. Any excess probabilities (pool_proba and
            train_proba) are thrown away and recomputed.

        Returns
        -------
        tuple:
            The query index, training indices and pool_indices.
        """
        query_i = 0
        train_idx = []
        if "labels" in self._logger._log_dict:
            self.y = np.array(self._logger._log_dict["labels"])
        qk = query_key(query_i)

        # Capture the labelled indices from the log file.
        while qk in self._logger._log_dict:
            new_labels = self._logger._log_dict[qk]["labelled"]
            label_idx = [x[0] for x in new_labels]
            inclusions = [x[1] for x in new_labels]
            self.y[label_idx] = inclusions
            train_idx.extend(label_idx)
            query_i += 1
            qk = query_key(query_i)
        query_i -= 1

        # Throw away the last probabilities if they have the same key
        # as the query. These values should be overwritten, since we're
        # starting out by training the model again.
        if query_i >= 0:
            qk = query_key(query_i)
            self._logger._log_dict[qk].pop("pool_proba", None)
            self._logger._log_dict[qk].pop("train_proba", None)

        self.train_idx = np.array(train_idx, dtype=np.int)
        self.query_i = query_i
        self.query_kwargs["src_query_idx"] = self._logger.get_src_query_idx()

    def review(self, stop_after_class=True):
        """ Do the systematic review, writing the results to the log file. """

        if not self.start_from_logger:
            # add prior knowledge
            init_idx, init_labels = self._prior_knowledge()
            self.y[init_idx] = init_labels

            self.query_i = 0
            self.train_idx = init_idx.copy()

            self._logger.add_labels(self.y)
            self.query_kwargs['last_bounds'] = [("random", 0, len(init_idx))]
            self.log_query(init_idx)

        # train the algorithm with prior knowledge
        self.train()
        if self.model_trained:
            self.log_probabilities()
        n_pool = self.X.shape[0] - len(self.train_idx)

        while not self._stop_iter(self.query_i-1, n_pool):

            # STEP 1: Make a new query
            query_idx = self.query(
                n_instances=min(self.n_instances, n_pool)
            )

            # STEP 2: Classify the queried papers.
            self.y[query_idx] = self._get_labels(query_idx)
            self._logger.add_labels(self.y)

            # STEP 3: Run inference (if necessary) and log the probabilities of
            # the model.
            self.train_idx = np.append(self.train_idx, query_idx)
            self.log_query(query_idx)

            # Option to stop after the classification set instead of training.
            if stop_after_class and self._stop_iter(self.query_i, n_pool):
                return

            # STEP 4: Train the algorithm with new data
            # Update the training data and pool afterwards
            self.train()
            if self.model_trained:
                self.log_probabilities()

            # STEP 5: Write all results to the logger
            # Update the query counter
            self.query_i += 1
            n_pool = self.X.shape[0] - len(self.train_idx)

            # Save the result to a file
            if self.log_file:
                self.save_logs(self.log_file)
                if self.verbose:
                    print(f"Saved results in log file: {self.log_file}")

    def log_probabilities(self):
            pool_idx = get_pool_idx(self.X, self.train_idx)

            # Log the probabilities of samples in the pool being included.
            pred_proba = self.query_kwargs.get('pred_proba', np.array([]))
            if len(pred_proba) == 0:
                pred_proba = self.learner.predict_proba(self.X)
            self._logger.add_proba(pool_idx, pred_proba[pool_idx])

            # Log the probabilities of samples that were trained.
            self._logger.add_proba(self.train_idx, pred_proba[self.train_idx],
                                   logname="train_proba")

    def log_query(self, query_idx):
            self._logger.add_training_log(query_idx, self.y[query_idx])
            self._logger.add_query_info(self.query_kwargs)

    def query(self, n_instances):
        """Query new results."""

        pool_idx = get_pool_idx(self.X, self.train_idx)

        n_instances = min(n_instances, len(pool_idx))
        if not self.model_trained:
            query_idx = pool_idx[np.random.choice(len(pool_idx), n_instances)]
        else:
            # Make a query from the pool.
            query_idx, _ = self.learner.query(
                X=self.X,
                pool_idx=pool_idx,
                n_instances=n_instances,
                query_kwargs=self.query_kwargs
            )
        return query_idx

    def classify(self, query_idx, inclusions):
        self.y[query_idx] = inclusions
        self.train_idx = np.unique(np.append(self.train_idx, query_idx))
        self._logger.add_training_log(query_idx, inclusions)

    def train(self):
        """Teach the algorithm with new data."""

        num_zero = np.count_nonzero(self.y == 0)
        num_one = np.count_nonzero(self.y == 1)
        if num_zero == 0 or num_one == 0:
            return
        # Get the training data.
        X_train, y_train = self.train_data(
            self.X, self.y, self.train_idx, **self.balance_kwargs)

        # Train the model on the training data.
        self.learner.teach(
            X=X_train,
            y=y_train,
            only_new=True,
            **self.fit_kwargs
        )
        self.query_kwargs["pred_proba"] = self.learner.predict_proba(self.X)
        self.model_trained = True

    def save_logs(self, *args, **kwargs):
        """Save the logs to a file."""

        self._logger.save(*args, **kwargs)

    def to_pickle(self, pickle_fp):
        try:
            with open(pickle_fp, "wb") as fp:
                dill.dump(self, fp)
        except TypeError:
            model_fp = os.path.splitext(pickle_fp)[0]+".h5"
            self.model.model.save(model_fp)
            current_model = self.model.__dict__.pop("model", None)
            with open(pickle_fp, "wb") as fp:
                dill.dump(self, fp)
            setattr(self.model, "model", current_model)

    @classmethod
    def from_pickle(cls, pickle_fp):
        with open(pickle_fp, "rb") as fp:
            my_instance = dill.load(fp)
        try:
            model_fp = os.path.splitext(pickle_fp)[0]+".h5"
            current_model = load_model(model_fp)
            setattr(my_instance.model, "model", current_model)
        except BaseException:
            pass
        return my_instance
