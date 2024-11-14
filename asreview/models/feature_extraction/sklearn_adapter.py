from asreview.models.feature_extraction.base import BaseFeatureExtraction


class SKLearnAdapter(BaseFeatureExtraction):
    def __init__(self, sklearn_model, **kwargs):
        self.model = sklearn_model(**kwargs)

    def fit(self, texts):
        self.model.fit(texts)

    def transform(self, texts):
        return self.model.transform(texts)
