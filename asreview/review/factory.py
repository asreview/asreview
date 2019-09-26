import json
import logging
import pickle
import time
from os.path import splitext
from pathlib import Path

from tensorflow.keras.wrappers.scikit_learn import KerasClassifier

from asreview.balance_strategies import get_balance_strategy
from asreview.config import AVAILABLE_CLI_MODI
from asreview.config import AVAILABLE_REVIEW_CLASSES
from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_MODEL
from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import DEFAULT_N_PRIOR_EXCLUDED
from asreview.config import DEFAULT_N_PRIOR_INCLUDED
from asreview.config import DEFAULT_QUERY_STRATEGY
from asreview.config import DEMO_DATASETS
from asreview.config import KERAS_MODELS
from asreview.logging import Logger
from asreview.models import create_lstm_base_model
from asreview.models import create_lstm_pool_model
from asreview.models import lstm_base_model_defaults
from asreview.models import lstm_fit_defaults
from asreview.models import lstm_pool_model_defaults
from asreview.models.embedding import download_embedding
from asreview.models.embedding import EMBEDDING_EN
from asreview.models.embedding import load_embedding
from asreview.models.embedding import sample_embedding
from asreview.query_strategies import get_query_strategy
from asreview.readers import ASReviewData
from asreview.review.minimal import MinimalReview
from asreview.review.oracle import ReviewOracle
from asreview.review.simulate import ReviewSimulate
from asreview.settings import ASReviewSettings
from asreview.types import is_pickle
from asreview.utils import get_data_home
from asreview.utils import text_to_features


def get_reviewer(dataset,
                 mode='oracle',
                 model=DEFAULT_MODEL,
                 query_strategy=DEFAULT_QUERY_STRATEGY,
                 balance_strategy=DEFAULT_BALANCE_STRATEGY,
                 n_instances=DEFAULT_N_INSTANCES,
                 n_papers=None,
                 n_queries=None,
                 embedding_fp=None,
                 verbose=0,
                 prior_included=None,
                 prior_excluded=None,
                 n_prior_included=DEFAULT_N_PRIOR_INCLUDED,
                 n_prior_excluded=DEFAULT_N_PRIOR_EXCLUDED,
                 config_file=None,
                 src_log_fp=None,
                 **kwargs
                 ):
    """ Get a review object from arguments. See __main__.py for a description
        Of the arguments.
    """

    # Find the URL of the datasets if the dataset is an example dataset.
    if dataset in DEMO_DATASETS.keys():
        dataset = DEMO_DATASETS[dataset]

    if src_log_fp is not None:
        logger = Logger(log_fp=src_log_fp)
        settings = logger.settings
    else:
        logger = None
        settings = ASReviewSettings(model=model, n_instances=n_instances,
                                    n_queries=n_queries,
                                    n_papers=n_papers,
                                    n_prior_included=n_prior_included,
                                    n_prior_excluded=n_prior_excluded,
                                    query_strategy=query_strategy,
                                    balance_strategy=balance_strategy,
                                    mode=mode, data_fp=dataset
                                    )

        settings.from_file(config_file)
    model = settings.model

    if model in ["lstm_base", "lstm_pool"]:
        base_model = "RNN"
    else:
        base_model = "other"

    # Check if mode is valid
    if mode in AVAILABLE_REVIEW_CLASSES:
        logging.info(f"Start review in '{mode}' mode.")
    else:
        raise ValueError(f"Unknown mode '{mode}'.")
    logging.debug(settings)

    # if the provided file is a pickle file
    if is_pickle(dataset):
        with open(dataset, 'rb') as f:
            data_obj = pickle.load(f)
        if isinstance(data_obj, tuple) and len(data_obj) == 3:
            X, y, embedding_matrix = data_obj
        elif isinstance(data_obj, tuple) and len(data_obj) == 4:
            X, y, embedding_matrix, _ = data_obj
        else:
            raise ValueError("Incorrect pickle object.")
    else:
        as_data = ASReviewData.from_file(dataset)
        _, texts, labels = as_data.get_data()

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
                    download_embedding()

            # create features and labels
            X, word_index = text_to_features(texts)
            y = labels
            if mode == "oracle":
                print("Loading embedding matrix. "
                      "This can take several minutes.")
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

    settings.fit_kwargs = {}
    settings.query_kwargs = {}

    if base_model == 'RNN':
        if model == "lstm_base":
            model_kwargs = lstm_base_model_defaults(settings, verbose)
            create_lstm_model = create_lstm_base_model
        elif model == "lstm_pool":
            model_kwargs = lstm_pool_model_defaults(settings, verbose)
            create_lstm_model = create_lstm_pool_model
        else:
            raise ValueError(f"Unknown model {model}")

        settings.fit_kwargs = lstm_fit_defaults(settings, verbose)
        settings.query_kwargs['verbose'] = verbose
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
    logging.info(f"Query strategy: {query_str}")

    train_data_fn, train_method = get_balance_strategy(settings)
    logging.info(f"Using {train_method} method to obtain training data.")

    # Initialize the review class.
    if mode == "simulate":
        reviewer = ReviewSimulate(
            X, y,
            model=model,
            query_strategy=query_fn,
            train_data_fn=train_data_fn,
            n_papers=settings.n_papers,
            n_instances=settings.n_instances,
            n_queries=settings.n_queries,
            verbose=verbose,
            prior_included=prior_included,
            prior_excluded=prior_excluded,
            n_prior_included=settings.n_prior_included,
            n_prior_excluded=settings.n_prior_excluded,
            fit_kwargs=settings.fit_kwargs,
            balance_kwargs=settings.balance_kwargs,
            query_kwargs=settings.query_kwargs,
            logger=logger,
            **kwargs)
    elif mode == "oracle":
        reviewer = ReviewOracle(
            X,
            model=model,
            query_strategy=query_fn,
            as_data=as_data,
            train_data_fn=train_data_fn,
            n_papers=settings.n_papers,
            n_instances=settings.n_instances,
            n_queries=settings.n_queries,
            verbose=verbose,
            prior_included=prior_included,
            prior_excluded=prior_excluded,
            fit_kwargs=settings.fit_kwargs,
            balance_kwargs=settings.balance_kwargs,
            query_kwargs=settings.query_kwargs,
            logger=logger,
            **kwargs)
    elif mode == "minimal":
        reviewer = MinimalReview(
            X,
            model=model,
            query_strategy=query_fn,
            train_data_fn=train_data_fn,
            n_papers=settings.n_papers,
            n_instances=settings.n_instances,
            n_queries=settings.n_queries,
            verbose=verbose,
            prior_included=prior_included,
            prior_excluded=prior_excluded,
            fit_kwargs=settings.fit_kwargs,
            balance_kwargs=settings.balance_kwargs,
            query_kwargs=settings.query_kwargs,
            logger=logger,
            **kwargs)
    else:
        raise ValueError("Error finding mode, should never come here...")

    reviewer._logger.add_settings(settings)

    return reviewer


def review(*args, mode="simulate", model=DEFAULT_MODEL, save_model_fp=None,
           **kwargs):
    """ Perform a review from arguments. Compatible with the CLI interface. """
    if mode not in AVAILABLE_CLI_MODI:
        raise ValueError(f"Unknown mode '{mode}'.")

    reviewer = get_reviewer(*args, mode=mode, model=model, **kwargs)

    # Wrap in try expect to capture keyboard interrupt
    try:
        # Start the review process.
        reviewer.review()
    except KeyboardInterrupt:
        print('\nClosing down the automated systematic review.')

    # If we're dealing with a keras model, we can save the last model weights.
    if save_model_fp is not None and model in KERAS_MODELS:
        save_model_h5_fp = splitext(save_model_fp)[0]+".h5"
        json_model = model.model.to_json()
        with open(save_model_fp, "w") as f:
            json.dump(json_model, f, indent=2)
        model.model.save_weights(save_model_h5_fp, overwrite=True)

    if not reviewer.log_file:
        print(reviewer._logger._print_logs())


def review_oracle(dataset, *args, **kwargs):
    """CLI to the interactive mode."""
    review(dataset, *args, mode='oracle', **kwargs)


def review_simulate(dataset, *args, **kwargs):
    """CLI to the oracle mode."""

    review(dataset, *args, mode='simulate', **kwargs)
