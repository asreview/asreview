from abc import ABC, abstractmethod

import numpy as np

from modAL.models import ActiveLearner

from asr.init_sampling import sample_prior_knowledge


EPOCHS = 3
BATCH_SIZE = 64

N_INCLUDED = 10
N_EXCLUDED = 40


class Review(ABC):
    """Base class for Systematic Review"""

    def __init__(self,
                 X, 
                 y = None,
                 model = None,
                 query_strategy = None,
                 data = None,
                 frac_included=None,
                 n_instances=1,
                 n_queries=10,
                 log_output='logs',
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
        self.log_output = log_output
        self.verbose = verbose

        self.n_included = N_INCLUDED
        self.n_excluded = N_EXCLUDED

    @abstractmethod
    def _prior_knowledge(self):
        pass

    @abstractmethod
    def _classify(self, ind):
        """Classify the provided indices."""
        pass

    def review(self):

        # create the pool indices
        pool_ind = np.arange(self.X.shape[0])

        # add prior knowledge
        init_ind = self._prior_knowledge()

        if self.frac_included is not None:
            _weights = {0: 1 / (1-self.frac_included), 1: 1 / self.frac_included}
        else:
            _weights = None

        # initialize ActiveLearner
        self.learner = ActiveLearner(
            estimator=self.model,
            X_training=self.X[init_ind, ],
            y_training=self.y[init_ind, ],

            # keyword arguments to pass to keras.fit()
            batch_size=BATCH_SIZE,
            epochs=EPOCHS,
            shuffle=True,
            class_weight=_weights,

            verbose=self.verbose)

        # remove the initial sample from the pool
        pool_ind = np.delete(pool_ind, init_ind)

        # result_df = pd.DataFrame({'label': [x[1] for x in pool_ideal.data]})
        query_i = 0

        while query_i <= self.n_queries:

            # Make a query from the pool.
            query_ind, query_instance = self.learner.query(
                self.X[pool_ind],
                n_instances=self.n_instances,
                verbose=self.verbose
            )

            # classify records (can be the user or an oracle)
            y = self._classify(query_ind)

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

                verbose=1)

            # remove queried instance from pool
            pool_ind = np.delete(pool_ind, query_ind, axis=0)

            # predict the label of the unlabeled entries in the pool
            pred = self.learner.predict(self.X[pool_ind])

            # # reset the memory of the model
            # self.learner._model.set_weights(init_weights)

            # update the query counter
            query_i += 1

        # save the result to a file
        # output_dir = os.path.join(log_output, 'file.log')
        # if not os.path.exists(output_dir):
        #     os.makedirs(output_dir)
        # export_path = os.path.join(
        #     output_dir, 'dataset_{}_systematic_review_active{}_q_{}.csv'.format(
        #         args.dataset, args.T, args.query_strategy))

        # result_df.to_csv(export_path)
        # input("Press any key to continue...")


class ReviewOracle(Review):
    """Automated Systematic Review"""

    def __init__(self, X, y, model, query_strategy, *args, **kwargs):
        super(ReviewOracle, self).__init__(
            X, y, model, query_strategy, data=None, *args, **kwargs
        )

    def _prior_knowledge(self):

        # Create the prior knowledge
        init_ind = sample_prior_knowledge(
            self.y,
            n_included=self.n_included,
            n_excluded=self.n_excluded,
            random_state=None  # TODO
        )

        return init_ind

    def _classify(self, ind):
        """Classify with oracle."""

        return self.y[ind, ]


class ReviewInteractive(Review):
    """Automated Systematic Review"""

    def __init__(self, X, model, query_strategy, data, *args, **kwargs):
        super(ReviewInteractive, self).__init__(
            X, y=None, model=model, query_strategy=query_strategy,
            data=data, *args, **kwargs
        )

    def _prior_knowledge(self):

        # Create the prior knowledge
        init_ind = sample_prior_knowledge(
            self.y,
            n_included=self.n_included,
            n_excluded=self.n_excluded,
            random_state=None  # TODO
        )

        return init_ind

    def _format_paper(self, title=None, abstract=None, keywords=None, authors=None):

        return f"{title}\n{authors}\n{abstract}"

    def _classify(self, ind):

        y = np.zeros((len(ind),))

        for i in ind:
            print(self.X[i])

        return y
