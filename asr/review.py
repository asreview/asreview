#!/usr/bin/env python3
# Systematic Review with LSTM Active
#
#
# Authors: Parisa Zahedi, Jonathan de Bruin

import os
import sys
import warnings
import argparse

# modAL dependencies
from modAL.uncertainty import uncertainty_sampling

# asr dependencies
from asr.base import ReviewOracle, ReviewInteractive
from asr.utils import load_data, text_to_features
from asr.query_strategies import random_sampling


def review(dataset,
           mode='interactive',
           model="lstm",
           query_strategy="lc",
           n_instances=1, dropout=0.4, **kwargs):

    if mode == 'interactive':
        print("Interactive mode not implemented.")
        return

    # data, labels = load_data(dataset)

    # # get the model
    # if isinstance(dataset, str) & (model.lower() == 'lstm'):

    #     from tensorflow.keras.utils import to_categorical
    #     from tensorflow.keras.wrappers.scikit_learn import KerasClassifier
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

        from tensorflow.keras.wrappers.scikit_learn import KerasClassifier
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


def review_interactive(dataset, **kwargs):
    """CLI to the interactive mode."""

    review(dataset, mode='interactive', **kwargs)


def review_oracle(dataset, **kwargs):
    """CLI to the oracle mode."""

    review(dataset, mode='oracle', **kwargs)
