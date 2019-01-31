#!/usr/bin/env python3
# Systematic Review with LSTM Active
#
#
# Authors: Parisa Zahedi, Jonathan de Bruin

import os
import sys
import warnings
import argparse
import pickle

# modAL dependencies
from modAL.uncertainty import uncertainty_sampling

# asr dependencies
from asr import ReviewOracle, ReviewInteractive
from asr.utils import load_data, text_to_features
from asr.query_strategies import random_sampling
from asr.ascii import ASCII_TEA
from asr.types import is_pickle


def _get_query_method(method):
    """Function to get the query method"""

    if method in ['lc', 'sm']:
        return uncertainty_sampling, 'Least confidence'
    elif method == 'random':
        return random_sampling, 'Random'
    else:
        raise ValueError(
            f"Query strategy '{method}' not found."
        )


def _load_embedding_matrix(fp, word_index):
    """Load embedding"""

    from asr.models.embedding import load_embedding, sample_embedding

    embedding, words = load_embedding(fp)
    return sample_embedding(embedding, words, word_index)


def review(dataset,
           mode='interactive',
           model="lstm",
           query_strategy="lc",
           n_instances=1,
           embedding=None,
           verbose=1,
           included=[],
           excluded=[],
           **kwargs
):

    # PREPARE FEATURES.
    #
    # Generate features from the dataset.

    # if the provided file is a pickle file
    if is_pickle(dataset):
        with open(dataset, 'rb') as f:
            data_obj = pickle.load(f)
        if isinstance(data_obj, tuple) and len(data_obj) == 3:
            X, y, embedding_matrix = data_obj
        else:
            raise ValueError("Incorrect pickle object.")
    else:

        # This takes some time
        if mode == "interactive":
            print("Prepare dataset.\n")
            print(ASCII_TEA)

        data, labels = load_data(dataset)

        # get the model
        if isinstance(dataset, str) & (model.lower() == 'lstm') & (embedding is not None):

            from tensorflow.keras.utils import to_categorical

            # create features and labels
            X, word_index = text_to_features(data)
            y = to_categorical(labels) if labels.ndim == 1 else labels
            embedding_matrix = _load_embedding_matrix(embedding, word_index)

    # get the model
    if isinstance(dataset, str) & (model.lower() == 'lstm'):

        from tensorflow.keras.wrappers.scikit_learn import KerasClassifier
        from asr.models import create_lstm_model

        # create the model
        model = KerasClassifier(
            create_lstm_model(embedding_matrix=embedding_matrix,
                              verbose=verbose)
        )

    else:
        raise ValueError('Model not found.')

    # Pick query strategy
    query_fn, query_str = _get_query_method(query_strategy)

    try:

        if mode == 'oracle':
            # start the review process
            reviewer = ReviewOracle(
                X, y,
                model,
                query_fn,
                n_instances=n_instances,
                verbose=verbose)
        elif mode == 'interactive':

            if included is None:
                # provide prior knowledge
                print("Are there papers you definitively want to include?")
                included = input(
                    "Give the indices of these papers. Separate them with spaces.\n"
                    "Include: ")

            if excluded is None: 
                print("Are there papers you definitively want to exclude?")
                excluded = input(
                    "Give the indices of these papers. Separate them with spaces.\n"
                    "Exclude: ")

            # start the review process
            reviewer = ReviewInteractive(
                X,
                model,
                query_fn,
                n_instances=n_instances,
                verbose=verbose)

        # Start the review process.
        reviewer.review()

    except KeyboardInterrupt:

        # TODO: save results.
        print('\nClosing down the automated systematic review.')


def review_interactive(dataset, **kwargs):
    """CLI to the interactive mode."""

    review(dataset, mode='interactive', **kwargs)


def review_oracle(dataset, **kwargs):
    """CLI to the oracle mode."""

    review(dataset, mode='oracle', **kwargs)
