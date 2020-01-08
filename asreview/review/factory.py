# Copyright 2019 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json
import logging
import os
from os.path import splitext

from asreview.balance_strategies.utils import get_balance_with_settings
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
from asreview.logging.utils import open_logger
from asreview.models.utils import get_model_class
from asreview.query_strategies.utils import get_query_with_settings
from asreview.readers import ASReviewData
from asreview.review.minimal import MinimalReview
from asreview.review.oracle import ReviewOracle
from asreview.review.simulate import ReviewSimulate
from asreview.settings import ASReviewSettings


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
                 log_file=None,
                 model_param=None,
                 query_param=None,
                 balance_param=None,
                 abstract_only=False,
                 extra_dataset=[],
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
        abstract_only=abstract_only)
    cli_settings.from_file(config_file)

    if log_file is not None:
        with open_logger(log_file) as logger:
            if logger.is_empty():
                logger.add_settings(cli_settings)
            settings = logger.settings
    else:
        settings = cli_settings
        logger = None

    if n_queries is not None:
        settings.n_queries = n_queries
    if n_papers is not None:
        settings.n_papers = n_papers
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

    as_data = ASReviewData.from_file(dataset, extra_dataset=extra_dataset,
                                     abstract_only=settings.abstract_only)
    _, texts, labels = as_data.get_data()
    data_prior_included, data_prior_excluded = as_data.get_priors()
    if len(data_prior_included) != 0:
        if prior_included is None:
            prior_included = []
        prior_included.extend(data_prior_included.tolist())
    if len(data_prior_excluded) != 0:
        if prior_excluded is None:
            prior_excluded = []
        prior_excluded.extend(data_prior_excluded.tolist())

    if as_data.final_labels is not None:
        with open_logger(log_file) as logger:
            logger.set_final_labels(as_data.final_labels)

    model_class = get_model_class(model)
    model_inst = model_class(param=settings.model_param,
                             embedding_fp=embedding_fp)
    X, y = model_inst.get_Xy(texts, labels)

    model_fn = model_inst.model()
    settings.fit_kwargs = model_inst.fit_kwargs()

    # Pick query strategy
    query_fn, query_str = get_query_with_settings(
        settings, texts, embedding_fp)
    logging.info(f"Query strategy: {query_str}")

    train_data_fn, train_method = get_balance_with_settings(settings)
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
            final_labels=as_data.final_labels,
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
            log_file=log_file,
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
            log_file=log_file,
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


def review_oracle(dataset, *args, log_file=None, **kwargs):
    """CLI to the interactive mode."""
    from PyInquirer import prompt, Separator
    if log_file is None:
        while True:
            question = [{
                'type': 'input',
                'name': 'log_file',
                'message': 'Please provide a file to store '
                'the results of your review:'
            }]
            log_file = prompt(question).get("log_file", "")
            if len(log_file) == 0:
                question = [{
                    'type': 'confirm',
                    'message': 'Are you sure you want to continue without'
                    ' saving?',
                    'name': 'force_continue',
                    'default': 'False',
                }]
                force_continue = prompt(question).get('force_continue', False)
                if force_continue:
                    log_file = None
                    break
            else:
                if os.path.isfile(log_file):
                    question = [{
                        'type': 'list',
                        'name': 'action',
                        'message': f'File {log_file} exists, what do you want'
                        ' to do?',
                        'choices': [
                            f'Continue review from {log_file}',
                            f'Delete review in {log_file} and start a new'
                            ' review',
                            f'Choose another file name.',
                            Separator(),
                            f'Exit'
                        ]
                    }]
                    action = prompt(question).get('action', 'Exit')
                    if action == "Exit":
                        return
                    if action.startswith("Continue"):
                        break
                    if action.startswith("Choose another"):
                        continue
                    if action.startswith("Delete"):
                        question = [{
                            'type': 'confirm',
                            'message': f'Are you sure you want to delete '
                            f'{log_file}?',
                            'name': 'delete',
                            'default': 'False',
                        }]
                        delete = prompt(question).get("delete", False)
                        if delete:
                            os.remove(log_file)
                            break
                        else:
                            continue

                break
    try:
        review(dataset, *args, mode='oracle', log_file=log_file, **kwargs)
    except KeyboardInterrupt:
        print('\nClosing down the automated systematic review.')


def review_simulate(dataset, *args, **kwargs):
    """CLI to the oracle mode."""

    review(dataset, *args, mode='simulate', **kwargs)
