from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier as SKRandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression

__all__ = [
    "SVMClassifier",
    "RandomForestClassifier",
    "NaiveBayesClassifier",
    "LogisticClassifier",
]


class SVMClassifier(SVC):
    name = "svm"
    label = "Support vector machine"

    def __init__(self, gamma="auto", C=15.4, kernel="linear", **kwargs):
        super().__init__(
            kernel=kernel,
            C=C,
            gamma=gamma,
            probability=False,
            **kwargs,
        )


class RandomForestClassifier(SKRandomForestClassifier):
    name = "rf"
    label = "Random forest"

    def __init__(self, n_estimators=100, max_features=10, **kwargs):
        super().__init__(
            n_estimators=int(n_estimators),
            max_features=int(max_features),
            **kwargs,
        )


class NaiveBayesClassifier(MultinomialNB):
    name = "nb"
    label = "Naive Bayes"

    def __init__(self, alpha=3.822, **kwargs):
        super().__init__(alpha=alpha, **kwargs)


class LogisticClassifier(LogisticRegression):
    name = "logistic"
    label = "Logistic regression"

    def __init__(self, C=1.0, solver="liblinear", **kwargs):
        super().__init__(C=C, solver=solver, **kwargs)
