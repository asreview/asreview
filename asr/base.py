from abc import ABC, abstractmethod

import numpy as np
from numpy import linalg as LA

from modAL.models import ActiveLearner

from asr.init_sampling import sample_prior_knowledge
from asr.logging import Logger
from asr.ascii import ASCII_TEA
from asr.balanced_al import rebalance_train_data, balanced_train_data
from asr.balanced_al import validation_data, undersample

N_INCLUDED = 10
N_EXCLUDED = 40


def _set_dyn_cw(n_included, n_queried, fit_kwargs, dyn_cw=None):
    if dyn_cw is None:
        return
    weight0 = 1
    if n_included:
        weight1 = (n_queried-n_included)/(dyn_cw*n_included)
    else:
        weight1 = 1
    fit_kwargs['class_weight'] = {
        0: weight0,
        1: weight1,
    }
    print(f"Using class weights: 0 <- {weight0}, 1 <- {weight1}")
    print(f"{n_included}, {n_queried}")


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


class Review(ABC):
    """Base class for Systematic Review"""

    def __init__(self,
                 X,
                 y=None,
                 model=None,
                 query_strategy=None,
                 n_instances=1,
                 n_queries=None,
                 prior_included=[],
                 prior_excluded=[],
                 log_file=None,
                 fit_kwargs={},
                 verbose=1):
        super(Review, self).__init__()

        self.X = X
        self.y = y
        self.model = model
        self.query_strategy = query_strategy

        self.n_instances = n_instances
        self.n_queries = n_queries
        self.log_file = log_file
        self.verbose = verbose

        self.prior_included = prior_included
        self.prior_excluded = prior_excluded

        self.fit_kwargs = fit_kwargs

        self._logger = Logger()

    @abstractmethod
    def _prior_knowledge(self):
        pass

    @abstractmethod
    def _classify(self, ind):
        """Classify the provided indices."""
        pass

    def _prior_teach(self):
        """Function called before training model."""

        pass

    def _stop_iter(self, query_i, pool):
        """Criteria for stopping iteration.

        Stop iterating if:
            - n_queries is reached
            - the pool is empty
        """

        stop_iter = False

        # if the pool is empty, always stop
        if len(pool) == 0:
            stop_iter = True

        # don't stop if there is no stopping criteria
        if self.n_queries is not None and query_i >= self.n_queries:
            stop_iter = True

        return stop_iter

    def review(self):
#         X_copy = self.X.copy()
#         y_copy = self.y.copy()
#         print(LA.norm(self.X), LA.norm(self.y))
        n_epoch = self.fit_kwargs['epochs']
        batch_size = self.fit_kwargs['batch_size']
        ratio = 1
        # create the pool and training indices.
        pool_ind = np.arange(self.X.shape[0])
        train_ind = np.array([], dtype=int)

        # add prior knowledge
        init_ind, init_labels = self._prior_knowledge()
#         n_included = np.sum(init_labels)

        # Labeled indices
        train_ind = np.append(train_ind, init_ind)
        # remove the initial sample from the pool
        pool_ind = np.delete(pool_ind, init_ind)

#         if "dyn_class_weight" in self.fit_kwargs:
#             dyn_cw = self.fit_kwargs.pop("dyn_class_weight")
#         else:
#             dyn_cw = None
#         _set_dyn_cw(n_included, len(train_ind), self.fit_kwargs, dyn_cw)

        validation_data(self.X[pool_ind], self.y[pool_ind], self.fit_kwargs)
        # train model
        self._prior_teach()

        # initialize ActiveLearner
        self.learner = ActiveLearner(
            estimator=self.model,
            query_strategy=self.query_strategy,

            # additional arguments to pass to fit
            **self.fit_kwargs)
#         print(np.where(self.y == 1))
        train_X, train_y = balanced_train_data(
            self.X[train_ind], self.y[train_ind], self.fit_kwargs,
            ratio=ratio, pref_batch_size=batch_size, n_epoch=n_epoch)

        self.model.fit(
            x=train_X,
            y=train_y,
            **self.fit_kwargs,
            )
        self._logger.add_training_log(init_ind, init_labels)
        query_i = 0

        while not self._stop_iter(query_i, pool_ind):

            pred_proba = []
            # Make a query from the pool.
            # query_ind_pool are indices relative to the pool_ind.
            query_pool_ind, query_instance = self.learner.query(
                self.X[pool_ind],
                n_instances=min(self.n_instances, len(pool_ind)),
                pred_proba=pred_proba,
            )
            # Get the query indices relative to all paper ids.
            query_ind = pool_ind[query_pool_ind]

            # Log the probabilities of samples in the pool being included.
            if len(pred_proba) == 0:
                pred_proba = [self.learner.predict_proba(self.X[pool_ind])]
            self._logger.add_proba(
                    pool_ind, pred_proba[0]
            )

            pred_proba_train = self.learner.predict_proba(self.X[train_ind])
            self._logger.add_proba(train_ind, pred_proba_train,
                                   logname="train_proba")
            # remove queried instance from pool
            pool_ind = np.delete(pool_ind, query_pool_ind, axis=0)

            # classify records (can be the user or an oracle)
            y = self._classify(query_ind)
#             n_included += np.sum(y)
            train_ind = np.append(train_ind, query_ind)
#             train_X, train_y, n_mini_epoch = rebalance_train_data(
#                 self.X[train_ind], self.y[train_ind], max_mini_epoch=n_epoch)
            train_X, train_y = balanced_train_data(
                self.X[train_ind], self.y[train_ind], self.fit_kwargs,
                ratio=ratio, pref_batch_size=batch_size, n_epoch=n_epoch)

            validation_data(self.X[pool_ind], self.y[pool_ind], self.fit_kwargs)
#             for i, rx in enumerate(train_X):
#                 print("Here equal")
#                 for j, compx in enumerate(X_copy):
#                     if np.array_equal(compx, rx):
#                         print(i, train_y[i], j, y_copy[j])
#                         assert train_y[i] == y_copy[j]
#                 print(rx, train_y[i], i)
#             print(train_ind)
#             print(train_X)
#             print(train_y)
            # train model
            self._prior_teach()
            # Teach the learner the new labelled data.
            self.learner.teach(
                X=train_X,
                y=train_y,

                # Train on both new and old labels, since we're retraining all.
                only_new=True,

                # additional arguments to pass to fit
                **self.fit_kwargs)

            # Add the query indexes to the log.
            self._logger.add_training_log(query_ind, y)


            # update the query counter
            query_i += 1

        # Produce the final set of prediction probabilities
        if len(pool_ind) > 0:
            pred_proba = self.learner.predict_proba(self.X[pool_ind])
            self._logger.add_proba(pool_ind, pred_proba)

        pred_proba_train = self.learner.predict_proba(self.X[train_ind])
        self._logger.add_proba(train_ind, pred_proba_train,
                               logname="train_proba")

        # Save the result to a file
        if self.log_file:
            self.save_logs(self.log_file)

        # print the results
        if self.verbose:
            print(f"Saved results in log file: {self.log_file}")

    def save_logs(self, *args, **kwargs):
        """Save the logs to a file."""

        self._logger.save(*args, **kwargs)


class ReviewSimulate(Review):
    """Automated Systematic Review"""

    def __init__(self,
                 X,
                 y,
                 model,
                 query_strategy,
                 n_prior_included=None,
                 n_prior_excluded=None,
                 *args, **kwargs):
        super(ReviewSimulate, self).__init__(
            X, y, model, query_strategy, *args, **kwargs)

        self.n_prior_included = n_prior_included
        self.n_prior_excluded = n_prior_excluded

    def _prior_knowledge(self):

        if self.prior_included and self.prior_excluded:
            prior_indices, prior_labels = _merge_prior_knowledge(
                self.prior_included,
                self.prior_excluded
            )

            return prior_indices, prior_labels

        elif self.n_prior_included and self.n_prior_excluded:

            # Create the prior knowledge
            init_ind = sample_prior_knowledge(
                self.y,
                n_prior_included=self.n_prior_included,
                n_prior_excluded=self.n_prior_excluded,
                random_state=None  # TODO
            )

            return init_ind, self.y[init_ind, ]
        else:
            raise ValueError(
                "provide both prior_included and prior_excluded, "
                "or n_prior_included and n_prior_excluded"
            )

    def _classify(self, ind):
        """Classify with oracle.

        Arguments
        ---------
        ind: list, np.array
            A list with indices

        Returns
        -------
        list, np.array
            The corresponding true labels for each indice.
        """

        return self.y[ind, ]


class ReviewOracle(Review):
    """Automated Systematic Review"""

    def __init__(self, X, model, query_strategy, data, use_cli_colors=True,
                 *args, **kwargs):
        super(ReviewOracle, self).__init__(
            X,
            y=None,
            model=model,
            query_strategy=query_strategy,
            *args,
            **kwargs)

        self.data = data

        self.use_cli_colors = use_cli_colors

    def _prior_knowledge(self):
        """Create prior knowledge from arguments."""

        prior_indices, prior_labels = _merge_prior_knowledge(
            self.prior_included, self.prior_excluded)

        return prior_indices, prior_labels

    def _prior_teach(self):

        print("\n\n We work, you drink tea.\n")
        print(ASCII_TEA)

    def _format_paper(self,
                      title=None,
                      abstract=None,
                      keywords=None,
                      authors=None):

        # authors = "; ".join(authors)

        if self.use_cli_colors:
            title = "\033[95m" + title + "\033[0m"

        # return f"\n{title}\n\n{abstract}\n"
        return f"\n{title}\n{authors}\n\n{abstract}\n"

    def _classify_paper(self, index):

        # abstract = ast.literal_eval(
        #     self.data.iloc[index]["abstract"]
        # )

        # CLI paper format
        _gui_paper = self._format_paper(
            title=self.data.iloc[index]["title"],
            abstract=self.data.iloc[index]["abstract"],
            authors=self.data.iloc[index]["authors"])
        print(_gui_paper)

        def _interact():
            # interact with the user
            included = input("Include [1] or exclude [0]: ")

            try:
                included = int(included)

                if included not in [0, 1]:
                    raise ValueError

                return included
            except Exception:

                # try again
                print(f"Incorrect value '{included}'")
                return _interact()

        included = _interact()

        if included == 1:
            label = 1
        elif included == 0:
            label = 0
        else:
            raise Exception

        return label

    def _classify(self, ind):

        y = np.zeros((len(ind), ))

        for j, index in enumerate(ind):

            label = self._classify_paper(index)

            y[j] = label

        return y
