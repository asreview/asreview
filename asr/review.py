#!/usr/bin/env python3
# Systematic Review with LSTM Active
#
#
# Authors: Parisa Zahedi, Jonathan de Bruin

import pickle
import time
from pathlib import Path

import pandas

# asr dependencies
from asr import ReviewSimulate, ReviewOracle
from asr.utils import load_data, text_to_features
from asr.config import MODUS
from asr.query_strategies import random_sampling, uncertainty_sampling
from asr.ascii import ASCII_TEA
from asr.types import is_pickle, convert_list_type
from asr.models.embedding import download_embedding, EMBEDDING_EN
from asr.models.embedding import load_embedding, sample_embedding
from asr.utils import get_data_home, _unsafe_dict_update, config_from_file
from asr.query_strategies import max_sampling


def _get_query_method(method):
    """Function to get the query method"""

    if method in ['max', 'max_sampling']:
        return max_sampling, "Maximum inclusion sampling"
    elif method in ['lc', 'sm', 'uncertainty']:
        return uncertainty_sampling, 'Least confidence / Uncertainty sampling'
    elif method == 'random':
        return random_sampling, 'Random'
    else:
        raise ValueError(
            f"Query strategy '{method}' not found."
        )


def review(dataset,
           mode='oracle',
           model="lstm",
           query_strategy="uncertainty",
           n_instances=1,
           embedding_fp=None,
           verbose=1,
           prior_included=None,
           prior_excluded=None,
           n_prior_included=None,
           n_prior_excluded=None,
           save_model=None,
           frac_included=None,
           config_file=None,
           **kwargs
           ):

    settings = {
        "model": model.lower(),
        "n_instances": n_instances,
        "query_strategy": query_strategy,
        "mode": mode,
        "model_param": {},
        "fit_param": {},
    }

    settings = _unsafe_dict_update(settings, config_from_file(config_file))

    # PREPARE FEATURES.
    #
    # Generate features from the dataset.
    if mode in MODUS:
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
        if mode == MODUS[0]:
            print("Prepare dataset.\n")
            print(ASCII_TEA)

        data = pandas.read_csv(dataset)
        texts, labels = load_data(dataset)

        # get the model
        if isinstance(dataset, str) & (model.lower() == 'lstm'):

            if embedding_fp is None:
                embedding_fp = Path(
                    get_data_home(),
                    EMBEDDING_EN["name"]
                ).expanduser()

                if not embedding_fp.exists():
                    print("Warning: will start to download large"
                          "embedding file in 10 seconds.")
                    time.sleep(10)
                    download_embedding(verbose=verbose)

            # create features and labels
            X, word_index = text_to_features(texts)
            y = labels
            embedding = load_embedding(embedding_fp, word_index=word_index)
            embedding_matrix = sample_embedding(embedding, word_index)

        elif isinstance(dataset, str) & (model.lower() in ['nb', 'svc', 'svm']):
            from sklearn.pipeline import Pipeline
            from sklearn.feature_extraction.text import TfidfTransformer
            from sklearn.feature_extraction.text import CountVectorizer

            text_clf = Pipeline([('vect', CountVectorizer()),
                                 ('tfidf', TfidfTransformer())])

            X = text_clf.fit_transform(texts)
            y = labels

    # Models

    fit_kwargs = {}

    if isinstance(dataset, str) & (model.lower() == 'lstm'):
        from tensorflow.keras.wrappers.scikit_learn import KerasClassifier
        from asr.models.lstm2 import create_lstm_model, lstm_model_defaults
        from asr.models.lstm2 import lstm_fit_defaults

        model_kwargs = lstm_model_defaults(settings, verbose)
        fit_kwargs = lstm_fit_defaults(settings, verbose)
        # create the model
        model = KerasClassifier(
            create_lstm_model(embedding_matrix=embedding_matrix,
                              **model_kwargs),
            verbose=verbose
        )

    elif isinstance(dataset, str) & (model.lower() in ['nb']):
        from asr.models import create_nb_model

        model = create_nb_model()

    elif isinstance(dataset, str) & (model.lower() in ['svm', 'svc']):
        from asr.models import create_svc_model

        model = create_svc_model()
    else:
        raise ValueError('Model not found.')

    # Pick query strategy
    query_fn, query_str = _get_query_method(settings["query_strategy"])
    if verbose:
        print(f"Query strategy: {query_str}")

    if mode == MODUS[1]:
        # start the review process
        reviewer = ReviewSimulate(
            X, y,
            model,
            query_fn,
            n_instances=n_instances,
            verbose=verbose,
            prior_included=prior_included,
            prior_excluded=prior_excluded,
            n_prior_included=n_prior_included,
            n_prior_excluded=n_prior_excluded,
            embedding_matrix=embedding_matrix,
            model_kwargs=model_kwargs,

            # Fit keyword arguments
            fit_kwargs=fit_kwargs,

            # Other
            **kwargs)

    elif mode == MODUS[0]:

        if prior_included is None:
            # provide prior knowledge
            print("Are there papers you definitively want to include?")
            prior_included = input(
                "Give the indices of these papers. Separate them with spaces.\n"
                "Include: ")
            prior_included = convert_list_type(prior_included.split(), int)

        if prior_excluded is None:
            print("Are there papers you definitively want to exclude?")
            prior_excluded = input(
                "Give the indices of these papers. Separate them with spaces.\n"
                "Exclude: ")
            prior_excluded = convert_list_type(prior_excluded.split(), int)

        # start the review process
        reviewer = ReviewOracle(
            X,
            model,
            query_fn,
            data,
            n_instances=n_instances,
            verbose=verbose,
            prior_included=prior_included,
            prior_excluded=prior_excluded,

            # fit keyword arguments
            fit_kwargs=fit_kwargs,

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
        print('\nSaving results.')

        if reviewer.log_file:
            reviewer.save_logs(reviewer.log_file)
        else:
            print(reviewer._logger._print_logs())

    # save the result to a file
    if reviewer.log_file:
        reviewer.save_logs(reviewer.log_file)
    else:
        print(reviewer._logger._print_logs())


def review_oracle(dataset, **kwargs):
    """CLI to the interactive mode."""

    review(dataset, mode='oracle', **kwargs)


def review_simulate(dataset, **kwargs):
    """CLI to the oracle mode."""

    review(dataset, mode='simulate', **kwargs)
