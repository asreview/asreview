import numpy as np

try:
    from sentence_transformers.SentenceTransformer import SentenceTransformer  #noqa
except ImportError:
    raise ImportError(
        "Install sentence_transformers package (`pip install "
        "sentence_transformers`) to use 'sentence_transformers' model.")


from asreview.feature_extraction.base import BaseFeatureExtraction


class SBERT(BaseFeatureExtraction):
    """Sentence BERT class for feature extraction."""
    name = "sbert"

    def transform(self, texts):
        model = SentenceTransformer('bert-base-nli-mean-tokens')
        X = np.array(model.encode(texts))
        return X
