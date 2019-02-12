from abc import ABC, abstractmethod

import numpy as np

from modAL.models import ActiveLearner

from asr.init_sampling import sample_prior_knowledge
from asr.utils import Logger
from asr.ascii import ASCII_TEA

EPOCHS = 3
BATCH_SIZE = 64

N_INCLUDED = 10
N_EXCLUDED = 40


class Review(ABC):
    """Base class for Systematic Review"""

    def __init__(self,
                 X,
                 y=None,
                 model=None,
                 query_strategy=None,
                 data=None,
                 frac_included=None,
                 n_instances=1,
                 n_queries=None,
                 log_file=None,
                 verbose=1):
        super(Review, self).__init__()

        self.X = X
        self.y = y
        self.model = model
        self.query_strategy = query_strategy
        self.data = data
        self.frac_included = frac_included

        self.n_instances = n_instances
        self.n_queries = n_queries
        self.log_file = log_file
        self.verbose = verbose

        self.n_included = N_INCLUDED
        self.n_excluded = N_EXCLUDED

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

    def _stop_iter(self, query_i):

        # don't stop if there is no stopping criteria
        # TODO: implement a stop when the pool is empty
        if self.n_queries is None:
            return False

        # number of queries not met yet
        if query_i <= self.n_queries:
            return False

        # stop
        return True

    def review(self):

        # create the pool indices
        pool_ind = np.arange(self.X.shape[0])

        # add prior knowledge
        init_ind, init_labels = self._prior_knowledge()

        if self.frac_included is not None:
            _weights = {
                0: 1 / (1 - self.frac_included),
                1: 1 / self.frac_included
            }
        else:
            _weights = None

        # train model
        self._prior_teach()

        # initialize ActiveLearner
        self.learner = ActiveLearner(
            estimator=self.model,
            X_training=self.X[init_ind, ],
            y_training=init_labels,

            # keyword arguments to pass to keras.fit()
            batch_size=BATCH_SIZE,
            epochs=EPOCHS,
            shuffle=True,
            class_weight=_weights,
            verbose=self.verbose)

        # remove the initial sample from the pool
        pool_ind = np.delete(pool_ind, init_ind)

        query_i = 0

        while not self._stop_iter(query_i):

            # Make a query from the pool.
            query_ind, query_instance = self.learner.query(
                self.X[pool_ind],
                n_instances=self.n_instances,
                verbose=self.verbose)

            # classify records (can be the user or an oracle)
            y = self._classify(query_ind)

            # train model
            self._prior_teach()

            # Teach the learner the new labelled data.
            self.learner.teach(
                X=query_instance,
                y=y,
                only_new=False,  # check docs!!!!

                # keyword arguments to pass to keras.fit()
                batch_size=BATCH_SIZE,
                epochs=EPOCHS,
                shuffle=True,
                class_weight=_weights,
                verbose=self.verbose)

            # remove queried instance from pool
            pool_ind = np.delete(pool_ind, query_ind, axis=0)

            # predict the label of the unlabeled entries in the pool
            pred = self.learner.predict(self.X[pool_ind])

            # add results to logger
            self._logger.add_training_log(query_ind, y, i=query_i)
            # self._logger.add_pool_log(pool_ind, pred, i=query_i)

            # # reset the memory of the model
            # self.learner._model.set_weights(init_weights)

            # update the query counter
            query_i += 1

        # save the result to a file
        if self.log_file:
            self.save_log(self.log_file)

        # print the results
        if self.verbose:
            print(self._logger._print_logs())

    def save_logs(self, *args, **kwargs):
        """Save the logs to a file."""

        self._logger.save(*args, **kwargs)


class ReviewSimulate(Review):
    """Automated Systematic Review"""

    def __init__(self, X, y, model, query_strategy, *args, **kwargs):
        super(ReviewSimulate, self).__init__(
            X, y, model, query_strategy, data=None, *args, **kwargs)

    def _prior_knowledge(self):

        # Create the prior knowledge
        init_ind = sample_prior_knowledge(
            self.y,
            n_included=self.n_included,
            n_excluded=self.n_excluded,
            random_state=None  # TODO
        )

        return init_ind, self.y[init_ind, ]

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

    def __init__(self, X, model, query_strategy, data, *args, **kwargs):
        super(ReviewOracle, self).__init__(
            X,
            y=None,
            model=model,
            query_strategy=query_strategy,
            data=data,
            *args,
            **kwargs)

    def _prior_knowledge(self):

        return np.array([0,1,2,3,4,5]), np.array([[1, 0],[1,0],[1,0],[ 1,0],[0,1],[0,1]])  # TODO

    def _prior_teach(self):

        print(ASCII_TEA)

    def _format_paper(self,
                      title=None,
                      abstract=None,
                      keywords=None,
                      authors=None):

        return f"{title}\n{authors}\n\n{abstract}\n"

    def _classify_paper(self, index):

        # CLI paper format
        _gui_paper = self._format_paper(
            title=self.data.iloc[index]["title"],
            abstract=self.data.iloc[index]["abstract"],
            authors=self.data.iloc[index]["authors"])
        print(_gui_paper)

        def _interact():
            # interact with the user
            included = input("Include [1] or exclude [0]:")

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
            label = [0, 1]
        elif included == 0:
            label = [1, 0]
        else:
            raise Exception

        return label

    def _classify(self, ind):

        y = np.zeros((len(ind), 2))

        for j, index in enumerate(ind):

            label = self._classify_paper(index)

            y[j] = label

        return y
