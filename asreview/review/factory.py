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
from os.path import splitext
from pathlib import PurePath

import numpy as np

from asreview.balance_strategies.utils import get_balance_model
from asreview.config import AVAILABLE_CLI_MODI, LABEL_NA
from asreview.config import AVAILABLE_REVIEW_CLASSES
from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_FEATURE_EXTRACTION
from asreview.config import DEFAULT_MODEL
from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import DEFAULT_N_PRIOR_EXCLUDED
from asreview.config import DEFAULT_N_PRIOR_INCLUDED
from asreview.config import DEFAULT_QUERY_STRATEGY
from asreview.config import KERAS_MODELS
from asreview.data import ASReviewData
from asreview.datasets import find_data
from asreview.feature_extraction.utils import get_feature_model
from asreview.models.utils import get_model
from asreview.query_strategies.utils import get_query_model
from asreview.review.minimal import MinimalReview
from asreview.review.simulate import ReviewSimulate
from asreview.settings import ASReviewSettings
from asreview.state.utils import open_state
from asreview.utils import get_random_state


def _add_defaults(set_param, default_param):
    set_param.update({key: value for key, value in default_param.items()
                      if key not in set_param})


def create_as_data(dataset, included_dataset=[], excluded_dataset=[],
                   prior_dataset=[], new=False):
    """Create ASReviewData object from multiple datasets."""
    if isinstance(dataset, (str, PurePath)):
        dataset = [dataset]

    if isinstance(included_dataset, (str, PurePath)):
        included_dataset = [included_dataset]

    if isinstance(excluded_dataset, (str, PurePath)):
        excluded_dataset = [excluded_dataset]

    if isinstance(prior_dataset, (str, PurePath)):
        prior_dataset = [prior_dataset]

    as_data = ASReviewData()
    # Find the URL of the datasets if the dataset is an example dataset.
    for data in dataset:
        as_data.append(ASReviewData.from_file(find_data(data)))

    if new:
        as_data.labels = np.full((len(as_data),), LABEL_NA, dtype=int)
    for data in included_dataset:
        as_data.append(ASReviewData.from_file(
            find_data(data), data_type="included"))
    for data in excluded_dataset:
        as_data.append(ASReviewData.from_file(
            find_data(data), data_type="excluded"))
    for data in prior_dataset:
        as_data.append(ASReviewData.from_file(
            find_data(data), data_type="prior"))
    return as_data


def get_reviewer(dataset,
                 mode="simulate",
                 model=DEFAULT_MODEL,
                 query_strategy=DEFAULT_QUERY_STRATEGY,
                 balance_strategy=DEFAULT_BALANCE_STRATEGY,
                 feature_extraction=DEFAULT_FEATURE_EXTRACTION,
                 n_instances=DEFAULT_N_INSTANCES,
                 n_papers=None,
                 n_queries=None,
                 embedding_fp=None,
                 verbose=0,
                 prior_idx=None,
                 n_prior_included=DEFAULT_N_PRIOR_INCLUDED,
                 n_prior_excluded=DEFAULT_N_PRIOR_EXCLUDED,
                 config_file=None,
                 state_file=None,
                 model_param=None,
                 query_param=None,
                 balance_param=None,
                 feature_param=None,
                 seed=None,
                 abstract_only=False,
                 included_dataset=[],
                 excluded_dataset=[],
                 prior_dataset=[],
                 new=False,
                 **kwargs
                 ):
    """Get a review object from arguments.

    See __main__.py for a description of the arguments.
    """
    as_data = create_as_data(dataset, included_dataset, excluded_dataset,
                             prior_dataset, new=new)

    if len(as_data) == 0:
        raise ValueError("Supply at least one dataset"
                         " with at least one record.")

    cli_settings = ASReviewSettings(
        model=model, n_instances=n_instances, n_queries=n_queries,
        n_papers=n_papers, n_prior_included=n_prior_included,
        n_prior_excluded=n_prior_excluded, query_strategy=query_strategy,
        balance_strategy=balance_strategy,
        feature_extraction=feature_extraction,
        mode=mode, data_fp=None,
        abstract_only=abstract_only)
    cli_settings.from_file(config_file)

    if state_file is not None:
        with open_state(state_file) as state:
            if state.is_empty():
                state.settings = cli_settings
            settings = state.settings
    else:
        settings = cli_settings

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
    if feature_param is not None:
        settings.feature_param = feature_param

    # Check if mode is valid
    if mode in AVAILABLE_REVIEW_CLASSES:
        logging.info(f"Start review in '{mode}' mode.")
    else:
        raise ValueError(f"Unknown mode '{mode}'.")
    logging.debug(settings)

    # Initialize models.
    random_state = get_random_state(seed)
    train_model = get_model(settings.model, **settings.model_param,
                            random_state=random_state)
    query_model = get_query_model(settings.query_strategy,
                                  **settings.query_param,
                                  random_state=random_state)
    balance_model = get_balance_model(settings.balance_strategy,
                                      **settings.balance_param,
                                      random_state=random_state)
    feature_model = get_feature_model(settings.feature_extraction,
                                      **settings.feature_param,
                                      random_state=random_state)

    # LSTM models need embedding matrices.
    if train_model.name.startswith("lstm-"):
        texts = as_data.texts
        train_model.embedding_matrix = feature_model.get_embedding_matrix(
            texts, embedding_fp)

    # Initialize the review class.
    if mode == "simulate":
        reviewer = ReviewSimulate(
            as_data,
            model=train_model,
            query_model=query_model,
            balance_model=balance_model,
            feature_model=feature_model,
            n_papers=settings.n_papers,
            n_instances=settings.n_instances,
            n_queries=settings.n_queries,
            prior_idx=prior_idx,
            n_prior_included=settings.n_prior_included,
            n_prior_excluded=settings.n_prior_excluded,
            state_file=state_file,
            **kwargs)
    elif mode == "minimal":
        reviewer = MinimalReview(
            as_data,
            model=train_model,
            query_model=query_model,
            balance_model=balance_model,
            feature_model=feature_model,
            n_papers=settings.n_papers,
            n_instances=settings.n_instances,
            n_queries=settings.n_queries,
            state_file=state_file,
            **kwargs)
    else:
        raise ValueError("Error finding mode, should never come here...")

    return reviewer


def review(*args, mode="simulate", model=DEFAULT_MODEL, save_model_fp=None,
           **kwargs):
    """Perform a review from arguments. Compatible with the CLI interface"""
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


def review_simulate(dataset, *args, **kwargs):
    """CLI simulate mode."""

    review(dataset, *args, mode='simulate', **kwargs)
