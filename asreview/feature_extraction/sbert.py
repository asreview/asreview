import numpy as np

try:
    from sentence_transformers.SentenceTransformer import SentenceTransformer  # noqa
except ImportError:
    ST_AVAILABLE = False
else:
    ST_AVAILABLE = True

from asreview.feature_extraction.base import BaseFeatureExtraction


def _check_st():
    if not ST_AVAILABLE:
        raise ImportError(
            "Install sentence_transformers package (`pip install "
            "sentence_transformers`) to use 'SBERT' model.")


class SBERT(BaseFeatureExtraction):
    """Sentence BERT class for feature extraction."""
    name = "sbert"

    def transform(self, texts):

        _check_st()

        model = SentenceTransformer('bert-base-nli-mean-tokens')
        X = np.array(model.encode(texts))
        return X
