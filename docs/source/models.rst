Models
======

There are several models implemented currently. The best performing is
at the moment the Naive Bayes algorithm.

nb
--

SKLearn Naive Bayes model.

See :class:`asreview.models.NBModel`

svm
---

See :class:`asreview.models.SVMModel`

SKLearn Support Vector Machine algorithm.

rf
--

SKLearn Random Forest model

See :class:`asreview.models.RFModel`


logistic
--------

SKLearn Logistic regression model

See :class:`asreview.models.LogisticModel`


nn-2-layer
----------

Neural network consisting of 2 equal size layers.

See :class:`asreview.models.DenseNNModel`


lstm-base
---------

LSTM model that consists of an embedding layer, LSTM layer with one
output, dense layer, single sigmoid output node.

See :class:`asreview.models.LSTMBaseModel`

lstm-pool
---------

LSTM model that consists of an embedding layer, LSTM layer with many
outputs, max pooling layer, single sigmoid output node.

See :class:`asreview.models.LSTMPoolModel`
