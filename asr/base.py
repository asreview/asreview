
import numpy as np

from modAL.models import ActiveLearner

from asr.init_sampling import sample_prelabeled


EPOCHS = 3
BATCH_SIZE = 64

N_INCLUDED = 10
N_EXCLUDED = 40


class Review(object):
    """Base class for Systematic Review"""

    def __init__(self,
                 model,
                 query_strategy,
                 n_instances=1,
                 log_output='logs',
                 verbose=1):
        super(Review, self).__init__()
        self.model = model
        self.query_strategy = query_strategy
        self.n_instances = n_instances
        self.log_output = log_output
        self.verbose = verbose

        self.n_included = N_INCLUDED
        self.n_excluded = N_EXCLUDED

    def review(self, X, y):

        # pool indices
        pool_ind = np.arange(X.shape[0])

        # Create the initial knowledge
        init_ind = sample_prelabeled(
            y,
            n_included=self.n_included,
            n_excluded=self.n_excluded,
            random_state=None  # TODO
        )
        weights = {0: 1 / y[:, 0].mean(), 1: 1 / y[:, 1].mean()}

        # initialize ActiveLearner
        self.learner = ActiveLearner(
            estimator=self.model,
            X_training=X[init_ind, ],
            y_training=y[init_ind, ],

            # keyword arguments to pass to keras.fit()
            batch_size=BATCH_SIZE,
            epochs=EPOCHS,
            shuffle=True,
            class_weight=weights,

            verbose=self.verbose)

        # remove the initial sample from the pool
        pool_ind = np.delete(pool_ind, init_ind)

        # result_df = pd.DataFrame({'label': [x[1] for x in pool_ideal.data]})
        query_i = 0
        n_queries = 10

        while query_i <= n_queries:

            # Make a query from the pool.
            query_ind, query_instance = self.learner.query(
                X,
                n_instances=self.n_instances,
                verbose=self.verbose
            )

            # Teach the learner the new labelled data.
            self.learner.teach(
                X=X[query_ind],
                y=y[query_ind],
                only_new=False,  # check docs!!!!

                # keyword arguments to pass to keras.fit()
                batch_size=BATCH_SIZE,
                epochs=EPOCHS,
                shuffle=True,
                class_weight=weights,

                verbose=1)

            # remove queried instance from pool
            pool_ind = np.delete(pool_ind, query_ind, axis=0)

            # predict the label of the unlabeled entries in the pool
            pred = self.learner.predict(X[pool_ind])

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

    def __init__(self, *args, **kwargs):
        super(ReviewOracle, self).__init__(*args, **kwargs)


class ReviewInteractive(Review):
    """Automated Systematic Review"""

    def __init__(self, *args, **kwargs):
        super(ReviewInteractive, self).__init__(*args, **kwargs)

        raise NotImplementedError("Not yet implemented.")
