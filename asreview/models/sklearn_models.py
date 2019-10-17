import logging

from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer

from asreview.models.base import BaseModel


def create_nb_model(*args, **kwargs):
    """Return callable NaiveBayes model.

    Arguments
    ---------

    Returns
    -------
    callable:
        A function that return the Sklearn model when
        called.

    """

    model = MultinomialNB(*args, **kwargs)
    logging.debug(model)

    return model


class NBModel(BaseModel):
    def __init__(self, model_kwargs={}, **kwargs):
        super(NBModel, self).__init__(model_kwargs)
        self.name = "nb"

    def model(self, *args, **kwargs):
        model = create_nb_model(*args, **self.model_kwargs, **kwargs)
        return model

    def default_kwargs(self):
        kwargs = {
            "alpha": 1.0,
        }
        return kwargs

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {}
        hyper_space = {
            "mdl_alpha": hp.lognormal("mdl_alpha", 0, 2),
        }
        return hyper_space, hyper_choices


def create_svc_model(*args, gamma="scale", class_weight=None, **kwargs):
    """Return callable SVM model.

    Arguments
    ---------

    Returns
    -------
    callable:
        A function that return the Sklearn model when
        called.

    """
    if class_weight is not None:
        class_weight = {
            0: 1,
            1: class_weight,
        }

    model = SVC(*args, gamma=gamma, class_weight=class_weight, probability=True, **kwargs)
    logging.debug(model)

    return model


class SVCModel(BaseModel):
    def __init__(self, model_kwargs={}, random_state=None, **kwargs):
        super(SVCModel, self).__init__(model_kwargs)
        self.model_kwargs["random_state"] = random_state
        self.name = "svm"

    def get_Xy(self, texts, labels):
        text_clf = Pipeline([('vect', CountVectorizer()),
                             ('tfidf', TfidfTransformer())])

        X = text_clf.fit_transform(texts)
        y = labels
        return X, y

    def model(self):
        model = create_svc_model(**self.model_kwargs)
        return model

    def default_param(self):
        kwargs = {
            "gamma": "auto",
            "class_weight": 0.249,
            "C": 15.4,
            "kernel": "sigmoid",
        }
        return kwargs

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {
            "mdl_gamma": ["auto", "scale"],
            "mdl_kernel": ["linear", "sigmoid", "rbf", "poly"]
        }

        hyper_space = {
            "mdl_gamma": hp.choice('mdl_gamma', hyper_choices["mdl_gamma"]),
            "mdl_kernel": hp.choice('mdl_kernel', hyper_choices["mdl_kernel"]),
            "mdl_C": hp.lognormal('mdl_C', 0, 2),
            "mdl_class_weight": hp.lognormal('mdl_class_weight', 0, 1)
        }
        return hyper_space, hyper_choices
