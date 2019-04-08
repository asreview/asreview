from abc import ABC, abstractmethod

import numpy as np
from numpy import linalg as LA

from modAL.models import ActiveLearner

from asr.init_sampling import sample_prior_knowledge
from asr.utils import Logger
from asr.ascii import ASCII_TEA
from asr.balanced_al import rebalance_train_data, balanced_train_data
from asr.balanced_al import validation_data, undersample, _set_class_weight
from asr.models.lstm2 import create_lstm_model
from asr.balanced_al import triple_balance_train
from asr.query_strategies.random_sampling import random_sampling

N_INCLUDED = 10
N_EXCLUDED = 40




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
                 model_kwargs={},
                 embedding_matrix=None,
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
        self.model_kwargs = model_kwargs
        self.embedding_matrix = embedding_matrix

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
#         print("start_xxx")
#         print(self.fit_kwargs)
        n_epoch = self.fit_kwargs['epochs']
        batch_size = self.fit_kwargs['batch_size']
        train_dist = self.fit_kwargs.pop('train_dist')
        frac_included = self.fit_kwargs.pop('frac_included')
        if train_dist == "rebalanced":
            get_train_data = balanced_train_data
            extra_train_args = {
                "pref_batch_size": batch_size,
                "n_epoch": n_epoch,
                "frac_included": frac_included,
            }
        else:
            get_train_data = undersample
            extra_train_args = {}
            _set_class_weight(1/frac_included, self.fit_kwargs)
        extra_train_args['ratio'] = self.fit_kwargs.pop('ratio')
        extra_train_args['shuffle'] = self.fit_kwargs['shuffle']
#         print(extra_train_args)
        extra_train_args['fit_kwargs'] = self.fit_kwargs
        self.fit_kwargs['shuffle'] = False
#         print(extra_train_args)
        n_instance_max = round(self.n_instances*0.95)
        n_instance_rand = self.n_instances-n_instance_max

        # create the pool and training indices.
        pool_ind = np.arange(self.X.shape[0])
#         train_ind = np.array([], dtype=int)

        # add prior knowledge
        init_ind, init_labels = self._prior_knowledge()
#         train_ind = init_ind.copy()
        rand_ind = init_ind.copy()
        pred_ind = np.array([], dtype=int)

        # remove the initial sample from the pool
        pool_ind = np.delete(pool_ind, init_ind)

#         print(f"batch_size = {self.fit_kwargs['batch_size']}")
#         print(np.where(self.y == 1))

        query_i = 0
        query_ind = init_ind

        while not self._stop_iter(query_i-1, pool_ind):
            self._logger.add_training_log(query_ind, self.y[query_ind])

            validation_data(self.X[pool_ind], self.y[pool_ind], self.fit_kwargs)
            X_train, y_train = triple_balance_train(self.X[rand_ind],
                                                    self.y[rand_ind],
                                                    self.X[pred_ind],
                                                    self.y[pred_ind],
                                                    fit_kwargs=self.fit_kwargs,
                                                    n_epoch=n_epoch)
#             print(train_ind[ind])
            from asr.query_strategies.max_sampling import max_sampling
            self.model = create_lstm_model(
                embedding_matrix=self.embedding_matrix,
                **self.model_kwargs)()
            self.model.fit(
                x=X_train,
                y=y_train,
                **self.fit_kwargs,
            )

            pred_proba = []
            # Make a query from the pool.
            # query_ind_pool are indices relative to the pool_ind.
#             print(min(n_instance_max, len(pool_ind)))
            query_pool_ind, _ = max_sampling(
                self.model,
                self.X[pool_ind],
                n_instances=min(n_instance_max, len(pool_ind)),
                pred_proba=pred_proba,
            )
            # Get the query indices relative to all paper ids.
            query_max_ind = pool_ind[query_pool_ind]

            # Log the probabilities of samples in the pool being included.
            if len(pred_proba) == 0:
                pred_proba = [self.model.predict_proba(self.X[pool_ind])]
            self._logger.add_proba(pool_ind, pred_proba[0])

            train_ind = np.append(rand_ind, pred_ind)

            # Log the probabilities of samples that were trained.
            pred_proba_train = self.model.predict_proba(self.X[train_ind])
            self._logger.add_proba(train_ind, pred_proba_train,
                                   logname="train_proba")

            pool_ind = np.delete(pool_ind, query_pool_ind, axis=0)
            pred_ind = np.append(pred_ind, query_max_ind)

            query_pool_ind, _ = random_sampling(
                self.model,
                self.X[pool_ind],
                n_instances=min(n_instance_rand, len(pool_ind))
            )

            query_rand_ind = pool_ind[query_pool_ind]
            rand_ind = np.append(rand_ind, query_rand_ind)

            # remove queried instance from pool
            pool_ind = np.delete(pool_ind, query_pool_ind, axis=0)

            # classify records (can be the user or an oracle)
#             train_ind = np.append(train_ind, query_ind)

            # update the query counter
            query_i += 1

        # Produce the final set of prediction probabilities
#         if len(pool_ind) > 0:
#             pred_proba = self.model.predict_proba(self.X[pool_ind], verbose=1)
#             self._logger.add_proba(pool_ind, pred_proba)

#         pred_proba_train = self.model.predict_proba(self.X[train_ind])
#         self._logger.add_proba(train_ind, pred_proba_train,
#                                logname="train_proba")

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
