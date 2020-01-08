from asreview.unsupervised.doc2vec import Doc2Vec
from asreview.unsupervised.tfidf import Tfidf
from asreview.unsupervised.sbert import SBERT
from asreview.unsupervised.embedding_idf import EmbeddingIdf


def get_unsupervised_class(method):
    if method == "doc2vec":
        return Doc2Vec
    elif method == "tfidf":
        return Tfidf
    elif method == "sbert":
        return SBERT
    elif method == "embedding_idf":
        return EmbeddingIdf

    raise ValueError(f"Unsupervised method '{method}' does not exist.")
