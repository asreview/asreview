from asreview.models.sklearn_models import SVCModel, NBModel
from asreview.models.lstm_base import LSTMBaseModel


def get_model_class(model):
    models = dict(
        svm=SVCModel,
        nb=NBModel,
        lstm_base=LSTMBaseModel
    )
    return models.get(model, None)

