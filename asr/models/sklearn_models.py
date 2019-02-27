
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC


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

    if verbose:
        print(model)

    return model


def create_svc_model(verbose=1):
    """Return callable SVM model.

    Arguments
    ---------

    Returns
    -------
    callable:
        A function that return the Sklearn model when
        called.

    """

    model = SVC(probability=True)

    if verbose:
        print(model)

    return model
