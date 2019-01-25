#!/usr/bin/env python3
# Systematic Review with LSTM Active
#
# Arguments:
#     -T: Task number
#     --dataset: Name of dataset
#     --n_queries: The number of queries
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


# modAL dependencies
from modAL.uncertainty import uncertainty_sampling

# asr dependencies
import asr
from asr.utils import text_to_features
from asr.query_strategies import random_sampling


EPOCHS = 3
BATCH_SIZE = 64

N_INCLUDED = 10
N_EXCLUDED = 40
N_INSTANCES = 50

# parse arguments if available
parser = argparse.ArgumentParser(
    description='Systematic review with the help of an oracle.'
)
# File path to the data.
parser.add_argument(
    "dataset",
    type=str,
    metavar='X',
    help=("File path to the dataset. The dataset " +
          "needs to be in the standardised format.")
)

# Active learning parameters
parser.add_argument(
    '--model',
    type=str,
    default='lstm',
    help="The prediction model for Active Learning. Default 'LSTM'.")
parser.add_argument(
    "--query_strategy",
    type=str,
    default='lc',
    help="The query strategy for Active Learning. Default 'lc'.")
parser.add_argument(
    "--n_instances",
    default=N_INSTANCES,
    type=int,
    help='Number of papers queried each query.')
parser.add_argument(
    "--n_queries",
    type=int,
    default=None,
    help="The number of queries. Default None"
)

# Initial data (prior knowledge)
parser.add_argument(
    "--n_included",
    default=None,
    type=int,
    nargs="*",
    help='Initial included papers.')

parser.add_argument(
    "--n_excluded",
    default=None,
    type=int,
    nargs="*",
    help='Initial excluded papers.')


def review_oracle():

    # parse all the arguments
    args = parser.parse_args()

    # data, labels = asr.load_data(args.dataset)

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
        '..',  # '..',
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
        reviewer = asr.Review(
            model, query_func, n_instances=args.n_instances)
        reviewer.oracle(X, y)

    except KeyboardInterrupt:
        print('Closing down.')


def review_interactive():

    raise NotImplementedError("Not implemented yet.")


if __name__ == '__main__':

    review_oracle()
