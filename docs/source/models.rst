Models
======

There are several models implemented currently. The best performing is
at the moment the Naive Bayes algorithm.

Parameters should be under the section ``[model_param]``.

nb
--

SKLearn Naive Bayes model. Only works in combination with the
`tfidf <feature_extraction.html#tfidf>`__ feature extraction
model. Though relatively simplistic, seems to work quite well on a wide range of datasets.

See :class:`asreview.models.NBModel`

svm
---

SKLearn Support Vector Machine algorithm.

See :class:`asreview.models.SVMModel`

rf
--

SKLearn Random Forest model.

See :class:`asreview.models.RFModel`


logistic
--------

SKLearn Logistic regression model.

See :class:`asreview.models.LogisticModel`


nn-2-layer
----------

Neural network consisting of 2 equal size layers. Recommended feature
extraction model is `doc2vec <feature_extraction.html#doc2vec>`__. Might crash on some systems with limited memory in combination
with `tfidf <feature_extraction.html#tfidf>`__.

See :class:`asreview.models.NN2LayerModel`


lstm-base
---------

LSTM model that consists of an embedding layer, LSTM layer with one
output, dense layer, and a single sigmoid output node. Use the
`embedding-lstm <feature_extraction.html#embedding-lstm>`__
feature extraction method. Currently not so well optimized and slow.

See :class:`asreview.models.LSTMBaseModel`

lstm-pool
---------

LSTM model that consists of an embedding layer, LSTM layer with many
outputs, max pooling layer, and a single sigmoid output node. Use the
`embedding-lstm <feature_extraction.html#embedding-lstm>`__
feature extraction method. Currently not so well optimized and slow.

See :class:`asreview.models.LSTMPoolModel`
