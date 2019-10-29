from asreview.models.sklearn_models import SVCModel, NBModel
from asreview.models.lstm_base import LSTMBaseModel
from asreview.models.lstm_pool import LSTMPoolModel


def get_model_class(model):
    "Get class of model from string."
    models = {
        "svm": SVCModel,
        "nb": NBModel,
        "lstm_base": LSTMBaseModel,
        "lstm_pool": LSTMPoolModel,
    }
    return models.get(model, None)
