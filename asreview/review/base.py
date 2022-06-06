import logging
from abc import ABC

import numpy as np
import pandas as pd

from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import LABEL_NA
from asreview.models.balance.simple import SimpleBalance
from asreview.models.classifiers import NaiveBayesClassifier
from asreview.models.feature_extraction.tfidf import Tfidf
from asreview.models.query.max import MaxQuery
from asreview.project import open_state
from asreview.settings import ASReviewSettings


class BaseReview(ABC):
    """Base class for Systematic Review.

    Arguments
    ---------
    as_data: asreview.ASReviewData
        The data object which contains the text, labels, etc.
    project: path-like
        Path to the project file.
    model: BaseTrainClassifier
        Initialized model to fit the data during active learning.
        See asreview.models.utils.py for possible models.
    query_model: BaseQueryStrategy
        Initialized model to query new instances for review, such as random
        sampling or max sampling.
        See asreview.query_strategies.utils.py for query models.
    balance_model: BaseBalance
        Initialized model to redistribute the training data during the
        active learning process. They might either resample or undersample
        specific papers.
    feature_model: BaseFeatureExtraction
        Feature extraction model that converts texts and keywords to
        feature matrices.
    n_instances: int
        Number of papers to query at each step in the active learning
        process.
    stop_if: int
        Number of steps/queries to perform. Set to None for no limit.
    start_idx: numpy.ndarray
        Start the simulation/review with these indices. They are assumed to
        be already labeled. Failing to do so might result bad behaviour.
    """

    def __init__(
        self,
        as_data,
        project,
        model=NaiveBayesClassifier(),
        query_model=MaxQuery(),
        balance_model=SimpleBalance(),
        feature_model=Tfidf(),
        n_papers=None,
        n_instances=DEFAULT_N_INSTANCES,
        stop_if=None,
        start_idx=[],
    ):
        """Initialize the reviewer base class, so that everything is ready to
        train a new model."""
        super(BaseReview, self).__init__()

        # Set the model.
        self.classifier = model
        self.balance_model = balance_model
        self.query_strategy = query_model
        self.feature_extraction = feature_model

        # Set the settings.
        self.as_data = as_data
        self.project = project
        self.n_instances = n_instances
        self.stop_if = stop_if
        self.prior_indices = start_idx

        if n_papers is not None:
            logging.warning("Argument n_papers is deprecated, ignoring n_papers.")

        # Get the known labels.
        self.data_labels = as_data.labels
        if self.data_labels is None:
            self.data_labels = np.full(len(as_data), LABEL_NA)

        with open_state(self.project, read_only=False) as state:
            # If the state is empty, add the settings.
            if state.is_empty():
                state.settings = self.settings

            # Add the record table to the state if it is not already there.
            self.record_table = state.get_record_table()
            if self.record_table.empty:
                state.add_record_table(as_data.record_ids)
                self.record_table = state.get_record_table()

            # Retrieve feature matrix from the project file or create
            # one from scratch.
            try:
                self.X = self.project.get_feature_matrix(
                    self.feature_extraction.name)
            except FileNotFoundError:
                self.X = self.feature_extraction.fit_transform(
                    as_data.texts,
                    as_data.headings,
                    as_data.bodies,
                    as_data.keywords
                )

                # check if the number of records after the transform equals
                # the number of records in the dataset
                if self.X.shape[0] != len(as_data):
                    raise ValueError(
                        "Dataset has {} records while feature "
                        "extractor returns {} records"
                        .format(len(as_data), self.X.shape[0]))

                self.project.add_feature_matrix(self.X,
                                                self.feature_extraction.name)

            # Check if the number or records in the feature matrix matches the
            # length of the dataset.
            if self.X.shape[0] != len(self.data_labels):
                raise ValueError("The state file does not correspond to the "
                                 "given data file, please use another state "
                                 "file or dataset.")

            # Make sure the priors are labeled.
            self._label_priors()

    @property
    def settings(self):
        """Get an ASReview settings object"""
        extra_kwargs = {}
        if hasattr(self, 'n_prior_included'):
            extra_kwargs['n_prior_included'] = self.n_prior_included
        if hasattr(self, 'n_prior_excluded'):
            extra_kwargs['n_prior_excluded'] = self.n_prior_excluded
        return ASReviewSettings(model=self.classifier.name,
                                query_strategy=self.query_strategy.name,
                                balance_strategy=self.balance_model.name,
                                feature_extraction=self.feature_extraction.name,
                                n_instances=self.n_instances,
                                stop_if=self.stop_if,
                                model_param=self.classifier.param,
                                query_param=self.query_strategy.param,
                                balance_param=self.balance_model.param,
                                feature_param=self.feature_extraction.param,
                                **extra_kwargs)

    def review(self):
        """Do a full review."""
        # Label any pending records.
        with open_state(self.project, read_only=False) as state:
            pending = state.get_pending()
            if not pending.empty:
                self._label(pending)

        # While the stopping condition has not been met:
        while not self._stop_review():
            # Train a new model.
            self.train()

            # Query for new records to label.
            record_ids = self._query(self.n_instances)

            # Label the records.
            self._label(record_ids)
        else:
            # write to state when stopped
            self._write_to_state()

    def _label_priors(self):
        """Make sure the prior records are labeled."""
        with open_state(self.project, read_only=False) as state:
            labeled = state.get_labeled()
            unlabeled_priors = [x for x in self.prior_indices
                                if x not in labeled['record_id'].to_list()]
            self._label(unlabeled_priors, prior=True)

    def _stop_review(self):
        """Check if the review should be stopped according to stopping rule
        obtained from the settings.

        Returns
        -------
        bool
            If True, the stopping criteria have been met.
        """
        stop = False

        # Get the pool and labeled. There never should be pending papers here.
        with open_state(self.project) as state:
            pool, labeled, _ = state.get_pool_labeled_pending()

        # if the pool is empty, always stop
        if pool.empty:
            stop = True

        # If stop_if is set to min, stop when all papers in the pool are
        # irrelevant.
        if self.stop_if == 'min' and (self.data_labels[pool] == 0).all():
            stop = True
        # Otherwise, stop when reaching stop_if (if provided)
        elif self.stop_if is not None:
            with open_state(self.project) as state:
                training_sets = state.get_training_sets()
                # There is one query per trained model. We subtract 1
                # for the priors.
                stop_if = len(set(training_sets)) - 1
            if stop_if >= self.stop_if:
                stop = True

        return stop

    def _query(self, n):
        """Query new records to label.

        Arguments
        ---------
        n: int
            Number of records to query.

        Returns
        -------
        list
            List of record_ids of the n top ranked records according to the last
            ranking saved in the state.
        """
        with open_state(self.project, read_only=False) as s:
            top_n_records = s.query_top_ranked(n)
        return top_n_records

    def _label(self, record_ids, prior=False):
        """Label queried records uses the known labels in a simulated review.

        Arguments
        ---------
        record_ids: list
            List of record_ids that will be labeled.
        prior: bool
            Whether the records priors or not.
        """
        labels = self.data_labels[record_ids]
        with open_state(self.project, read_only=False) as s:
            s.add_labeling_data(record_ids, labels, prior=prior)

    def train(self):
        """Train a new model on the labeled data."""
        # Check if both labels are available.
        with open_state(self.project) as state:
            labeled = state.get_labeled()
            labels = labeled['label'].to_list()
            training_set = len(labeled)
            if not (0 in labels and 1 in labels):
                raise ValueError('Not both labels available. '
                                 'Stopped training the model')

        # TODO: Simplify balance model input.
        # Use the balance model to sample the trainings data.
        y_sample_input = pd.DataFrame(self.record_table).\
            merge(labeled, how='left', on='record_id').\
            loc[:, 'label'].\
            fillna(LABEL_NA).\
            to_numpy()
        train_idx = np.where(y_sample_input != LABEL_NA)[0]

        X_train, y_train = self.balance_model.sample(
            self.X,
            y_sample_input,
            train_idx
        )

        # Fit the classifier on the trainings data.
        self.classifier.fit(X_train, y_train)

        # Use the query strategy to produce a ranking.
        ranked_record_ids = \
            self.query_strategy.query(self.X, classifier=self.classifier)

        # TODO: Also log the probablities.
        # Log the ranking in the state.
        with open_state(self.project, read_only=False) as state:
            state.add_last_ranking(ranked_record_ids,
                                   self.classifier.name,
                                   self.query_strategy.name,
                                   self.balance_model.name,
                                   self.feature_extraction.name,
                                   training_set)
