import json
import logging
import os
from os.path import splitext

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
from asreview.models.utils import get_model_class
from asreview.query_strategies.base import get_query_with_settings
from asreview.readers import ASReviewData
from asreview.review.minimal import MinimalReview
from asreview.review.oracle import ReviewOracle
from asreview.review.simulate import ReviewSimulate
from asreview.settings import ASReviewSettings
from asreview.hdf5_logging import HDF5_Logger


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
                 save_freq=1,
                 config_file=None,
                 log_file=None,
#                  src_log_fp=None,
                 model_param=None,
                 query_param=None,
                 balance_param=None,
                 **kwargs
                 ):
    """ Get a review object from arguments. See __main__.py for a description
        Of the arguments.
    """

    # Find the URL of the datasets if the dataset is an example dataset.
    if dataset in DEMO_DATASETS.keys():
        dataset = DEMO_DATASETS[dataset]

    cli_settings = ASReviewSettings(
        model=model, n_instances=n_instances, n_queries=n_queries,
        n_papers=n_papers, n_prior_included=n_prior_included,
        n_prior_excluded=n_prior_excluded, query_strategy=query_strategy,
        balance_strategy=balance_strategy, mode=mode, data_fp=dataset,
        save_freq=save_freq)
    cli_settings.from_file(config_file)

    if log_file is not None:
        with HDF5_Logger(log_file) as logger:
            if logger.is_empty():
                logger.add_settings(cli_settings)
            settings = logger.settings
    else:
        settings = cli_settings
        logger = None

    if model_param is not None:
        settings.model_param = model_param
    if query_param is not None:
        settings.query_param = query_param
    if balance_param is not None:
        settings.balance_param = balance_param

    model = settings.model

    # Check if mode is valid
    if mode in AVAILABLE_REVIEW_CLASSES:
        logging.info(f"Start review in '{mode}' mode.")
    else:
        raise ValueError(f"Unknown mode '{mode}'.")
    logging.debug(settings)

    as_data = ASReviewData.from_file(dataset)
    _, texts, labels = as_data.get_data()

    model_class = get_model_class(model)
    model_inst = model_class(param=settings.model_param,
                             embedding_fp=embedding_fp)
    X, y = model_inst.get_Xy(texts, labels)

    model_fn = model_inst.model()
    settings.fit_kwargs = model_inst.fit_kwargs()

    settings.query_kwargs = {}
    # Pick query strategy
    query_fn, query_str = get_query_with_settings(settings)
    logging.info(f"Query strategy: {query_str}")

    train_data_fn, train_method = get_balance_strategy(settings)
    logging.info(f"Using {train_method} method to obtain training data.")

    # Initialize the review class.
    if mode == "simulate":
        reviewer = ReviewSimulate(
            X, y,
            model=model_fn,
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
            log_file=log_file,
            save_freq=settings.save_freq,
            **kwargs)
    elif mode == "oracle":
        reviewer = ReviewOracle(
            X,
            model=model_fn,
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
            model=model_fn,
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

    return reviewer


def review(*args, mode="simulate", model=DEFAULT_MODEL, save_model_fp=None,
           **kwargs):
    """ Perform a review from arguments. Compatible with the CLI interface. """
    if mode not in AVAILABLE_CLI_MODI:
        raise ValueError(f"Unknown mode '{mode}'.")

    reviewer = get_reviewer(*args, mode=mode, model=model, **kwargs)

    # Start the review process.
    reviewer.review()

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

#     if (log_file is not None
#             and os.path.isfile(log_file)):
#         while(True):
#             continue_input = input("Project detected. Continue [y/n]?")
#             if continue_input in ["Y", "y", "yes"]:
#                 break
#             if continue_input not in ["N", "n", "no"]:
#                 print("Please provide 'y' or 'no'.")
#                 continue
#             overwrite_input = input("This will delete your previous"
#                                     " project and start a new one.\n Is that"
#                                     " what you want [y/n]?")
#             if overwrite_input in ["Y", "y", "yes"]:
#                 break
#             else:
#                 return

    review(dataset, *args, mode='oracle', **kwargs)


def review_simulate(dataset, *args, **kwargs):
    """CLI to the oracle mode."""

    review(dataset, *args, mode='simulate', **kwargs)
