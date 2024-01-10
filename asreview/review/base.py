__all__ = ["BaseReview"]


import numpy as np
import pandas as pd

from asreview.config import LABEL_NA
from asreview.models.balance.simple import SimpleBalance
from asreview.models.classifiers import NaiveBayesClassifier
from asreview.models.feature_extraction.tfidf import Tfidf
from asreview.models.query.max import MaxQuery
from asreview.project import open_state


class BaseReview:
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
    ):
        """Initialize the reviewer base class, so that everything is ready to
        train a new model."""

        # Set the model.
        self.classifier = model
        self.balance_model = balance_model
        self.query_strategy = query_model
        self.feature_extraction = feature_model

        # Set the settings.
        self.as_data = as_data
        self.project = project

        try:
            self.X = self.project.get_feature_matrix(self.feature_extraction.name)
        except FileNotFoundError:
            self.X = self.feature_extraction.fit_transform(
                as_data.texts, as_data.headings, as_data.bodies, as_data.keywords
            )

            # check if the number of records after the transform equals
            # the number of records in the dataset
            if self.X.shape[0] != len(as_data):
                raise ValueError(
                    f"Dataset has {len(as_data)} records while feature "
                    f"extractor returns {self.X.shape[0]} records"
                )

            self.project.add_feature_matrix(self.X, self.feature_extraction.name)

    def train(self):
        """Train a new model on the labeled data."""
        # Check if both labels are available.
        with open_state(self.project) as state:
            record_table = state.get_record_table()
            labeled = state.get_labeled()
            labels = labeled["label"].to_list()
            training_set = len(labeled)
            if not (0 in labels and 1 in labels):
                raise ValueError(
                    "Not both labels available. " "Stopped training the model"
                )

        # TODO: Simplify balance model input.
        # Use the balance model to sample the trainings data.
        y_sample_input = (
            pd.DataFrame(record_table)
            .merge(labeled, how="left", on="record_id")
            .loc[:, "label"]
            .fillna(LABEL_NA)
            .to_numpy()
        )
        train_idx = np.where(y_sample_input != LABEL_NA)[0]

        X_train, y_train = self.balance_model.sample(self.X, y_sample_input, train_idx)

        self.classifier.fit(X_train, y_train)

        ranked_record_ids, relevance_scores = self.query_strategy.query(
            self.X, classifier=self.classifier, return_classifier_scores=True
        )

        # Dump the ranking to the state
        with open_state(self.project, read_only=False) as state:
            state.add_last_ranking(
                ranked_record_ids,
                self.classifier.name,
                self.query_strategy.name,
                self.balance_model.name,
                self.feature_extraction.name,
                training_set,
            )

            if relevance_scores is not None:
                # relevance_scores contains scores for 'relevant' in the second column.
                state.add_last_probabilities(relevance_scores[:, 1])
