#!/usr/bin/env python3
# Systematic Review with LSTM Active
#
#
# Authors: Parisa Zahedi, Jonathan de Bruin

import json
import os
import time
import pickle
from pathlib import Path

# asr dependencies
from asreview import ReviewSimulate, ReviewOracle
from asreview.utils import text_to_features
from asreview.config import AVAILABLE_MODI
from asreview.ascii import ASCII_TEA
from asreview.types import is_pickle, convert_list_type
from asreview.models.embedding import download_embedding, EMBEDDING_EN
from asreview.models.embedding import load_embedding, sample_embedding
from asreview.utils import get_data_home
from asreview.query_strategies import get_query_strategy
from asreview.balance_strategies import get_balance_strategy
from asreview.logging import Logger
from asreview.settings import ASReviewSettings

from asreview.models import create_lstm_base_model, lstm_base_model_defaults
from asreview.models import create_lstm_pool_model, lstm_pool_model_defaults
from asreview.models import lstm_fit_defaults
from tensorflow.keras.wrappers.scikit_learn import KerasClassifier

from asreview.readers import read_data
from os.path import splitext


def review(dataset,
           mode='oracle',
           model="lstm",
           query_strategy="uncertainty",
           balance_strategy="simple",
           n_instances=1,
           n_queries=1,
           embedding_fp=None,
           verbose=1,
           prior_included=None,
           prior_excluded=None,
           n_prior_included=-1,
           n_prior_excluded=-1,
           save_model_fp=None,
           config_file=None,
           src_log_fp=None,
           **kwargs
           ):

    if src_log_fp is not None:
        logger = Logger(log_fp=src_log_fp)
        settings = logger._log_dict["settings"]
    else:
        logger = None
        settings = ASReviewSettings(model, n_instances, n_queries,
                                    n_prior_included, n_prior_excluded,
                                    query_strategy,
                                    balance_strategy, mode, dataset
                                    ).override(config_file)
    model = settings['model']
    print(f"Using {model} model")

    if model in ["lstm_base", "lstm_pool"]:
        base_model = "RNN"
    else:
        base_model = "other"

    # Check if mode is valid
    if mode in AVAILABLE_MODI:
        if verbose:
            print(f"Start review in '{mode}' mode.")
    else:
        raise ValueError(f"Unknown mode '{mode}'.")

    # if the provided file is a pickle file
    if is_pickle(dataset):
        with open(dataset, 'rb') as f:
            data_obj = pickle.load(f)
        if isinstance(data_obj, tuple) and len(data_obj) == 3:
            X, y, embedding_matrix = data_obj
            data = None
        elif isinstance(data_obj, tuple) and len(data_obj) == 4:
            X, y, embedding_matrix, data = data_obj
        else:
            raise ValueError("Incorrect pickle object.")
    else:

        # This takes some time
        if mode == "oracle":
            print("Prepare dataset.\n")
            print(ASCII_TEA)

        data, texts, labels = read_data(dataset)

        # get the model
        if base_model == "RNN":

            if embedding_fp is None:
                embedding_fp = Path(
                    get_data_home(),
                    EMBEDDING_EN["name"]
                ).expanduser()

                if not embedding_fp.exists():
                    print("Warning: will start to download large "
                          "embedding file in 10 seconds.")
                    time.sleep(10)
                    download_embedding(verbose=verbose)

            # create features and labels
            X, word_index = text_to_features(texts)
            y = labels
            embedding = load_embedding(embedding_fp, word_index=word_index)
            embedding_matrix = sample_embedding(embedding, word_index)

        elif model.lower() in ['nb', 'svc', 'svm']:
            from sklearn.pipeline import Pipeline
            from sklearn.feature_extraction.text import TfidfTransformer
            from sklearn.feature_extraction.text import CountVectorizer

            text_clf = Pipeline([('vect', CountVectorizer()),
                                 ('tfidf', TfidfTransformer())])

            X = text_clf.fit_transform(texts)
            y = labels

    settings['fit_kwargs'] = {}
    settings['query_kwargs'] = {}

    if base_model == 'RNN':
        if model == "lstm_base":
            model_kwargs = lstm_base_model_defaults(settings, verbose)
            create_lstm_model = create_lstm_base_model
        elif model == "lstm_pool":
            model_kwargs = lstm_pool_model_defaults(settings, verbose)
            create_lstm_model = create_lstm_pool_model
        else:
            raise ValueError(f"Unknown model {model}")

        settings['fit_kwargs'] = lstm_fit_defaults(settings, verbose)
        settings['query_kwargs']['verbose'] = verbose
        # create the model
        model = KerasClassifier(
            create_lstm_model(embedding_matrix=embedding_matrix,
                              **model_kwargs),
            verbose=verbose
        )

    elif model.lower() in ['nb']:
        from asreview.models import create_nb_model

        model = create_nb_model()

    elif model.lower() in ['svm', 'svc']:
        from asreview.models import create_svc_model

        model = create_svc_model()
    else:
        raise ValueError('Model not found.')

    # Pick query strategy
    query_fn, query_str = get_query_strategy(settings)
    if verbose:
        print(f"Query strategy: {query_str}")

    train_data_fn, train_method = get_balance_strategy(settings)
    if verbose:
        print(f"Using {train_method} method to obtain training data.")

    if mode == "simulate":
        # start the review process
        reviewer = ReviewSimulate(
            X, y,
            model=model,
            query_strategy=query_fn,
            train_data_fn=train_data_fn,
            n_instances=n_instances,
            n_queries=n_queries,
            verbose=verbose,
            prior_included=prior_included,
            prior_excluded=prior_excluded,
            n_prior_included=n_prior_included,
            n_prior_excluded=n_prior_excluded,
            fit_kwargs=settings['fit_kwargs'],
            balance_kwargs=settings['balance_kwargs'],
            query_kwargs=settings['query_kwargs'],
            logger=logger,

            # Other
            **kwargs)

    elif mode == "oracle":

        if prior_included is None:
            # provide prior knowledge
            print("Are there papers you definitively want to include?")
            prior_included = input(
                "Give the indices of these papers. "
                "Separate them with spaces.\n"
                "Include: ")
            prior_included = convert_list_type(prior_included.split(), int)

        if prior_excluded is None:
            print("Are there papers you definitively want to exclude?")
            prior_excluded = input(
                "Give the indices of these papers. "
                "Separate them with spaces.\n"
                "Exclude: ")
            prior_excluded = convert_list_type(prior_excluded.split(), int)

        # start the review process
        reviewer = ReviewOracle(
            X,
            model=model,
            query_strategy=query_fn,
            data=data,
            n_instances=n_instances,
            n_queries=n_queries,
            verbose=verbose,
            prior_included=prior_included,
            prior_excluded=prior_excluded,
            fit_kwargs=settings['fit_kwargs'],
            balance_kwargs=settings['balance_kwargs'],
            query_kwargs=settings['query_kwargs'],
            logger=logger,

            # other keyword arguments
            **kwargs)

    # wrap in try expect to capture keyboard interrupt
    try:
        # Start the review process.
        if verbose:
            print("Start with the systematic review.")
        reviewer._logger.add_settings(settings)
        reviewer.review()
    except KeyboardInterrupt:
        print('\nClosing down the automated systematic review.')

    # If we're dealing with a keras model, we can save the last model weights.
    if save_model_fp is not None and base_model == "RNN":
        save_model_h5_fp = splitext(save_model_fp)[0]+".h5"
        json_model = model.model.to_json()
        with open(save_model_fp, "w") as f:
            json.dump(json_model, f, indent=2)
        model.model.save_weights(save_model_h5_fp, overwrite=True)

    if not reviewer.log_file:
        print(reviewer._logger._print_logs())


def review_oracle(dataset, **kwargs):
    """CLI to the interactive mode."""

    review(dataset, mode='oracle', **kwargs)


def review_simulate(dataset, **kwargs):
    """CLI to the oracle mode."""

    review(dataset, mode='simulate', **kwargs)
