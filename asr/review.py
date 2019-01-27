#!/usr/bin/env python3
# Systematic Review with LSTM Active
#
#
# Authors: Parisa Zahedi, Jonathan de Bruin

import os
import sys
import argparse

# data frameworks


# modAL dependencies
from modAL.uncertainty import uncertainty_sampling

# asr dependencies
from asr.base import ReviewOracle
from asr.utils import load_data, text_to_features
from asr.query_strategies import random_sampling

MODES = ["interactive", "oracle"]

MODEL = 'lstm'
QUERY_STRATEGY = 'lc'

EPOCHS = 3
BATCH_SIZE = 64

N_INCLUDED = 10
N_EXCLUDED = 40
N_INSTANCES = 50


def parse_arguments(prog=sys.argv[0]):

    # parse arguments if available
    parser = argparse.ArgumentParser(
        prog=prog,
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
        default=MODEL,
        help="The prediction model for Active Learning. Default 'LSTM'.")
    parser.add_argument(
        "--query_strategy",
        type=str,
        default=QUERY_STRATEGY,
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

    return parser


def review(dataset,
           mode='interactive',
           model= MODEL,
           query_strategy= QUERY_STRATEGY,
           n_instances=N_INSTANCES, dropout=0.4, **kwargs):

    # data, labels = load_data(dataset)

    # # get the model
    # if isinstance(dataset, str) & (model.lower() == 'lstm'):

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
    if isinstance(dataset, str) & (model.lower() == 'lstm'):

        from keras.wrappers.scikit_learn import KerasClassifier
        from asr.models import create_lstm_model
# ///////////////////// HACK

        # create the model
        model = KerasClassifier(
            create_lstm_model(
                embedding_matrix=embedding_matrix,
                backwards=True,
                dropout=dropout,
                max_sequence_length=1000
            )
        )

    else:
        raise ValueError('Model not found.')

    # Pick query strategy
    if (query_strategy in ['lc', 'sm']):
        query_func_str = 'Least confidence'
        query_func = uncertainty_sampling
    elif (query_strategy == 'random'):
        query_func_str = 'Random'
        query_func = random_sampling
    # elif (query_strategy == 'lcb'):
    #     qs = UncertaintySampling(pool, method='lcb', model=model)
    # elif (query_strategy == 'lcbmc'):
    #     qs = ModelChangeSampling(
    #         pool, method='lcbmc', model=model, prev_score=prev_score)
    else:
        pass
    print('Query strategy: {}.'.format(query_func_str))

    try:
        # start the review process
        reviewer = ReviewOracle(
            model,
            query_func,
            n_instances=n_instances)
        reviewer.review(X, y)

    except KeyboardInterrupt:
        print('Closing down.')


def review_interactive():
    """CLI to the interactive mode."""

    parser = parse_arguments(prog="asr interactive")
    args = parser.parse_args(sys.argv[2:])

    args_dict = vars(args)
    path = args_dict.pop("dataset")

    # review(path, mode='interactive', **args_dict)

    raise NotImplementedError("Not implemented yet.")


def review_oracle():
    """CLI to the oracle mode."""

    parser = parse_arguments(prog="asr oracle")
    args = parser.parse_args(sys.argv[2:])

    args_dict = vars(args)
    path = args_dict.pop("dataset")

    review(path, mode='oracle', **args_dict)


def main():

    # launch asr interactively
    if len(sys.argv) > 1 and sys.argv[1] == "interactive":
        review_interactive()

    # launch asr with oracle
    elif len(sys.argv) > 1 and sys.argv[1] == "oracle":
        review_oracle()

    # no valid sub command
    else:
        parser = argparse.ArgumentParser(
            description='Automated Systematic Review.'
        )
        parser.add_argument(
            "subcommand",
            type=lambda x: isinstance(x, str) and x in MODES,
            help="the subcommand to launch"
        )
        parser.parse_args()


if __name__ == '__main__':

    main()
