import sys

import numpy as np

from asreview.feature_extraction.base import BaseFeatureExtraction


class SBERT(BaseFeatureExtraction):
    """Sentence BERT class for feature extraction."""
    name = "sbert"

    def transform(self, texts):
        try:
            from sentence_transformers.SentenceTransformer import SentenceTransformer  #noqa
        except ImportError:
            print("Error: install sentence_transformers package "
                  "(`pip install sentence_transformers`)"
                  " to use Sentence BERT.")
            sys.exit(192)
        model = SentenceTransformer('bert-base-nli-mean-tokens')
        X = np.array(model.encode(texts))
        return X
