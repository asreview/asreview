# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from sklearn.ensemble import RandomForestClassifier as SKRandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC

__all__ = [
    "SVM",
    "RandomForest",
    "NaiveBayes",
    "Logistic",
]


class SVM(LinearSVC):
    """Support vector machine classifier.

    Based on the sklearn implementation of the support vector machine
    sklearn.svm.LinearSVC.
    """

    name = "svm"
    label = "Support vector machine"


class RandomForest(SKRandomForestClassifier):
    """Random forest classifier.

    Based on the sklearn implementation of the random forest
    sklearn.ensemble.RandomForestClassifier.
    """

    name = "rf"
    label = "Random forest"


class NaiveBayes(MultinomialNB):
    """Naive Bayes classifier.

    Based on the sklearn implementation of the naive bayes
    sklearn.naive_bayes.MultinomialNB.
    """

    name = "nb"
    label = "Naive Bayes"


class Logistic(LogisticRegression):
    """Logistic regression classifier.

    Based on the sklearn implementation of the logistic regression
    sklearn.linear_model.LogisticRegression.
    """

    name = "logistic"
    label = "Logistic regression"
