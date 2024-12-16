from sklearn.utils.class_weight import compute_sample_weight

from asreview.models.base import BaseModel


class Balanced(BaseModel):
    name = "balanced"
    label = "Balanced Sample Weight"

    def __init__(self, ratio=1.0):
        self.ratio = ratio

    def compute_sample_weight(self, y, *args, **kwargs):
        weights = compute_sample_weight(
            {1: 1.0, 0: sum(y == 1) / (self.ratio * sum(y == 0))}, y=y
        )
        return weights * (len(y) / sum(weights))
