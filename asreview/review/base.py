import os
from abc import ABC, abstractmethod


from modAL.models import ActiveLearner
from tensorflow.python.keras.models import load_model
import numpy as np
import dill

from asreview.logging import Logger, query_key
from asreview.balance_strategies import full_sample
from asreview.query_strategies import max_sampling, random_sampling
from asreview.config import NOT_AVAILABLE, DEFAULT_N_INSTANCES


def get_pool_idx(X, train_idx):
    return np.delete(np.arange(X.shape[0]), train_idx, axis=0)


def _merge_prior_knowledge(included, excluded, return_labels=True):
    """Merge prior included and prior excluded."""

    prior_indices = np.array(np.append(included, excluded), dtype=np.int)

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
                 n_papers=None,
                 n_instances=DEFAULT_N_INSTANCES,
                 n_queries=None,
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

        self.n_papers = n_papers
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

        self.query_kwargs["query_src"] = {}
        self.query_kwargs["current_queries"] = {}

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
            if "labelled" not in self._logger._log_dict[qk]:
                continue
            new_labels = self._logger._log_dict[qk]["labelled"]
            label_methods = self._logger._log_dict[qk]["label_methods"]
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

        self.train_idx = np.array(train_idx, dtype=np.int)
        self.query_i = query_i

    def review(self, stop_after_class=True):
        """ Do the systematic review, writing the results to the log file. """

        if not self.start_from_logger:
            # add prior knowledge
            init_idx, init_labels = self._prior_knowledge()
            self.query_i = 0
            self.train_idx = np.array([], dtype=np.int)
            self.classify(init_idx, init_labels, method="initial")

        if self._stop_iter(self.query_i, self.n_pool()):
            return

        # train the algorithm with prior knowledge
        self.train()
        if self.model_trained:
            self.log_probabilities()
            if self.log_file:
                self.save_logs(self.log_file)

        n_pool = self.X.shape[0] - len(self.train_idx)

        while not self._stop_iter(self.query_i-1, n_pool):

            # STEP 1: Make a new query
            query_idx = self.query(
                n_instances=self._next_n_instances()
            )

            # STEP 2: Classify the queried papers.
            self.classify(query_idx, self._get_labels(query_idx))
            self._logger.add_labels(self.y)

            # Option to stop after the classification set instead of training.
            if stop_after_class and self._stop_iter(self.query_i,
                                                    self.n_pool()):
                if self.log_file:
                    self.save_logs(self.log_file)
                    if self.verbose:
                        print(f"Saved results in log file: {self.log_file}")
                return

            # STEP 3: Train the algorithm with new data
            # Update the training data and pool afterwards
            self.train()
            if self.model_trained:
                self.log_probabilities()

            # STEP 4: Save the logs.
            if self.log_file:
                self.save_logs(self.log_file)
                if self.verbose:
                    print(f"Saved results in log file: {self.log_file}")

    def log_probabilities(self):
        """ Store the modeling probabilities of the training indices and
            pool indices. """
        pool_idx = get_pool_idx(self.X, self.train_idx)

        # Log the probabilities of samples in the pool being included.
        pred_proba = self.query_kwargs.get('pred_proba', np.array([]))
        if len(pred_proba) == 0:
            pred_proba = self.learner.predict_proba(self.X)
        self._logger.add_proba(pool_idx, pred_proba[pool_idx],
                               logname="pool_proba", i=self.query_i)

        # Log the probabilities of samples that were trained.
        self._logger.add_proba(self.train_idx, pred_proba[self.train_idx],
                               logname="train_proba", i=self.query_i)

    def query(self, n_instances):
        """Query new results."""

        pool_idx = get_pool_idx(self.X, self.train_idx)

        n_instances = min(n_instances, len(pool_idx))

        # If the model is not trained, choose random papers.
        if not self.model_trained:
            query_idx, _ = random_sampling(
                None, X=self.X, pool_idx=pool_idx, n_instances=n_instances,
                query_kwargs=self.query_kwargs)

        else:
            # Make a query from the pool.
            query_idx, _ = self.learner.query(
                X=self.X,
                pool_idx=pool_idx,
                n_instances=n_instances,
                query_kwargs=self.query_kwargs
            )
        return query_idx

    def classify(self, query_idx, inclusions, method=None):
        """ Classify new papers and update the training indices. """
        self.y[query_idx] = inclusions
        self.train_idx = np.unique(np.append(self.train_idx, query_idx))
        if method is None:
            methods = []
            for idx in query_idx:
                method = self.query_kwargs["current_queries"].pop(idx, None)
                if method is None:
                    method = "unknown"
                methods.append([idx, method])
                if method in self.query_kwargs["query_src"]:
                    self.query_kwargs["query_src"][method].append(idx)
                else:
                    self.query_kwargs["query_src"][method] = [idx]
        else:
            methods = [[idx, method] for idx in query_idx]
            if method in self.query_kwargs["query_src"]:
                self.query_kwargs["query_src"][method].extend(
                    query_idx.tolist())
            else:
                self.query_kwargs["query_src"][method] = query_idx.tolist()

        self._logger.add_classification(query_idx, inclusions, methods=methods,
                                        i=self.query_i)

    def train(self):
        """ Train the model. """

        num_zero = np.count_nonzero(self.y[self.train_idx] == 0)
        num_one = np.count_nonzero(self.y[self.train_idx] == 1)
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
        self.query_i += 1

    def save_logs(self, *args, **kwargs):
        """Save the logs to a file."""

        self._logger.save(*args, **kwargs)

    def to_pickle(self, pickle_fp):
        """
        Dump the self object to a pickle fill (using dill). Keras models
        Cannot be dumped, so they are written to a separate h5 file. The
        model is briefly popped out of the object to allow the rest to be
        written to a file. Do not rely on this method for long term storage
        of the class, since library changes could easily break it. In those
        cases, use the log + h5 file instead.
        """
        if "model" in self.model.__dict__:
            print(type(self.model.model).__name__)
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
        """
        Create a BaseReview object from a pickle file, and optiona h5 file.
        """
        with open(pickle_fp, "rb") as fp:
            my_instance = dill.load(fp)
        try:
            model_fp = os.path.splitext(pickle_fp)[0]+".h5"
            current_model = load_model(model_fp)
            setattr(my_instance.model, "model", current_model)
        except BaseException:
            pass
        return my_instance
