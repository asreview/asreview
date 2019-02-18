
from sklearn.naive_bayes import MultinomialNB


def create_nb_model(verbose=1):
    """Return callable NaiveBayes model.

    Arguments
    ---------

    Returns
    -------
    callable:
        A function that return the Sklearn model when
        called.

    """

    model = MultinomialNB()

    return model
