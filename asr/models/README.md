# Models

There are several models implemented currently. The best performing is at the moment the lstm_pool algorithm. 

## [nb](sklearn_models.py)

Naive Bayes model, default parameters.

## [svc](sklearn_models.py)

Support Vector Machine algorithm. Unoptimized.

## [LSTM-base](lstm_base.py)

LSTM model that consists of an embedding layer, LSTM layer with one output, dense layer, single sigmoid output node.

## [LSTM-pool](lstm_pool.py)

LSTM model that consists of an embedding layer, LSTM layer with many outputs, max pooling layer, single sigmoid output node.
