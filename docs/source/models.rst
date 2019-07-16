Models
======

There are several models implemented currently. The best performing is
at the moment the lstm_pool algorithm.

nb
--

See :func:`asreview.models.create_nb_model`

Naive Bayes model, default parameters.

svc
---

See :func:`asreview.models.create_svc_model`

Support Vector Machine algorithm. Unoptimized.

LSTM-base
---------

See :func:`asreview.models.create_lstm_base_model`

LSTM model that consists of an embedding layer, LSTM layer with one
output, dense layer, single sigmoid output node.

LSTM-pool
---------

See :func:`asreview.models.create_lstm_pool_model`

LSTM model that consists of an embedding layer, LSTM layer with many
outputs, max pooling layer, single sigmoid output node.
