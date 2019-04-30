# Models

There are several models implemented currently. The best performing is at the moment the lstm_pool algorithm. 

## nb

Naive Bayes model, default parameters.

## svc

Support Vector Machine algorithm. Unoptimized.

## LSTM-base

LSTM model that consists of an embedding layer, LSTM layer with one output, dense layer, single sigmoid output node.

## LSTM-pool

LSTM model that consists of an embedding layer, LSTM layer with many outputs, max pooling layer, single sigmoid output node.
