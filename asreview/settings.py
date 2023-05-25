from asreview.config import DEFAULT_N_INSTANCES
from asreview.models.balance import get_balance_model
from asreview.models.classifiers import get_classifier
from asreview.models.feature_extraction import get_feature_model
from asreview.models.query import get_query_model


class ASReviewSettings:
    def __init__(
        self,
        classifier,
        query_strategy,
        balance_strategy,
        feature_extraction,
        n_instances=DEFAULT_N_INSTANCES,
        stop_if=None,
        n_prior_included=None,
        n_prior_exlcuded=None,
        classifier_settings=None,
        query_strategy_settings=None,
        balance_strategy_settings=None,
        feature_extraction_settings=None,
    ):
        self.classifier = classifier
        self.query_strategy = query_strategy
        self.balance_strategy = balance_strategy
        self.feature_extraction = feature_extraction
        self.n_instances = n_instances
        self.stop_if = stop_if
        self.n_prior_included = n_prior_included
        self.n_prior_excluded = n_prior_exlcuded
        if classifier_settings is None:
            self.classifier_settings = get_classifier(classifier).default_settings
        else:
            self.classifier_settings = classifier_settings
        if balance_strategy_settings is None:
            self.balance_strategy_settings = get_balance_model(balance_strategy).default_settings
        else:
            self.balance_strategy_settings = balance_strategy_settings
        if query_strategy_settings is None:
            self.query_strategy_settings = get_query_model(query_strategy).default_settings
        else:
            self.query_strategy_settings = query_strategy_settings
        if feature_extraction_settings is None:
            self.feature_extraction_settings = get_feature_model(feature_extraction).default_settings
        else:
            self.feature_extraction_settings = feature_extraction_settings