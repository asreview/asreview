#!/usr/bin/env python3
# Systematic Review with LSTM Active
#
# Arguments:
#     -T: Task number
#     --dataset: Name of dataset
#     --quota: The number of queries
#     --init_included_papers: Initial number of included papers
#     --batch_size : Batch size
#     --model: A deep learning model to use for classification.
#     --query_strategy: "The query strategy"
#     --dropout: Ratio of NN units to drop out
#
# Authors: Parisa Zahedi, Jonathan de Bruin

import os
import argparse

# data frameworks
import numpy as np
import pandas as pd

# modAL dependencies
from modAL.models import ActiveLearner
from modAL.uncertainty import uncertainty_sampling

# asr dependencies
from asr.utils import load_data, text_to_features
from asr.query_strategies import random_sampling
from asr.init_sampling import sample_prelabeled


EPOCHS = 3
BATCH_SIZE = 64

N_INCLUDED = 10
N_EXCLUDED = 40
N_INSTANCES = 50

# parse arguments if available
parser = argparse.ArgumentParser(description='Active learning parameters')
# Task number
parser.add_argument("-T", default=1, type=int, help='Task number.')
# Database name
parser.add_argument(
    "--n_instances",
    default=N_INSTANCES,
    type=int,
    help='Number of paper queried each query.')
parser.add_argument(
    "--dataset",
    type=str,
    default='ptsd',
    help="The dataset to use for training.")
# The number of iteration
parser.add_argument(
    "--quota", type=int, default=10, help="The number of queries")
# The initial number of included papers
parser.add_argument(
    "--init_included_papers",
    default=10,
    type=int,
    help='Initial number of included papers')
# The number of papers that is labeled for each iteration
parser.add_argument("--batch_size", default=10, type=int, help='Batch size')
# Machine learninng model
parser.add_argument(
    '--model',
    type=str,
    default='lstm',
    help="A deep learning model to use for classification.")
# Query strategy
parser.add_argument(
    "--query_strategy", type=str, default='lc', help="The query strategy")
# Dropout
parser.add_argument("--dropout", default=0.4, type=float, help='dropout')

parser.add_argument("--init_indices", type=bool, default=True)


class SystematicReview(object):
    """Automated Systematic Review"""

    def __init__(self,
                 model,
                 query_strategy,
                 n_instances=1,
                 log_output="logs/"):
        super(SystematicReview, self).__init__()
        self.model = model
        self.query_strategy = query_strategy
        self.n_instances = n_instances
        self.log_output = log_output

        self.n_included = N_INCLUDED
        self.n_excluded = N_EXCLUDED

    def interactive(self):

        raise RuntimeError("Not implemented.")

    def oracle(self, X, y):

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

            verbose=1)

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
                verbose=1
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


def main():

    # parse all the arguments
    args = parser.parse_args()

    # data, labels = load_data(args.dataset)

    # # get the model
    # if isinstance(args.dataset, str) & (args.model.lower() == 'lstm'):

    #     from keras.utils import to_categorical
    #     from keras.wrappers.scikit_learn import KerasClassifier
    #     from asr.models import create_lstm_model

    #     # create features and labels
    #     X, word_index = text_to_features(data)
    #     y = to_categorical(labels) if labels.ndim == 1 else labels

    #     # Load embedding layer. This takes some time.
    #     from asr.models.embedding import load_embedding, sample_embedding

    #     embedding_fp = os.path.join("data", "pretrained_models", "wiki.en.vec")
    #     embedding, words = load_embedding(embedding_fp)
    #     embedding_matrix = sample_embedding(embedding, words, word_index)

# /////////////////////// HACK
    import pickle
    pickle_fp = os.path.join(
        '..', #'..',
        'automated-systematic-review-simulations',
        'pickle',
        'ptsd_vandeschoot_words_20000.pkl'
    )
    with open(pickle_fp, 'rb') as f:
        X, y, embedding_matrix = pickle.load(f)

    # get the model
    if isinstance(args.dataset, str) & (args.model.lower() == 'lstm'):

        from keras.wrappers.scikit_learn import KerasClassifier
        from asr.models import create_lstm_model
# ///////////////////// HACK

        # create the model
        model = KerasClassifier(
            create_lstm_model(
                embedding_matrix=embedding_matrix,
                backwards=True,
                dropout=args.dropout,
                max_sequence_length=1000
            )
        )

    else:
        raise ValueError('Model not found.')

    # Pick query strategy
    if (args.query_strategy in ['lc', 'sm']):
        query_func_str = 'Least confidence'
        query_func = uncertainty_sampling
    elif (args.query_strategy == 'random'):
        query_func_str = 'Random'
        query_func = random_sampling
    # elif (args.query_strategy == 'lcb'):
    #     qs = UncertaintySampling(pool, method='lcb', model=model)
    # elif (args.query_strategy == 'lcbmc'):
    #     qs = ModelChangeSampling(
    #         pool, method='lcbmc', model=model, prev_score=prev_score)
    else:
        pass
    print('Query strategy: {}.'.format(query_func_str))

    try:
        # start the review process
        reviewer = SystematicReview(
            model, query_func, n_instances=args.n_instances)
        reviewer.oracle(X, y)

    except KeyboardInterrupt:
        print('Closing down.')


if __name__ == '__main__':

    main()
