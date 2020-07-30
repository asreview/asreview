Active learning algorithms
==========================


.. contents:: Table of Contents

Feature Extraction
------------------

Feature extraction is the process of converting a list of texts into some kind
of feature matrix.

Parameters in the config file should be under the section
``[feature_param]``.

We have currently implemented the following feature extraction methods:

tfidf
~~~~~


Use the standard TF-IDF (Term Frequency-Inverse Document Frequency) feature extraction
from `SKLearn <https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html>`__.

Gives a sparse matrix as output. Works well in combination with
`Naive Bayes <models.html#nb>`__ and other
fast training models (given that the features vectors are relatively wide).

See :class:`asreview.feature_extraction.Tfidf`.

doc2vec
~~~~~~~

Feature extraction method provided by the `gensim <https://radimrehurek.com/gensim/>`__ package.
To use it, please install the gensim package manually:

.. code:: bash

	pip install gensim

It takes relatively long to create a feature matrix with this method. However, this only has
to be done once per simulation/review. The upside of this method is the dimension-reduction
that generally takes place, which makes the modelling quicker.

See :class:`asreview.feature_extraction.Doc2Vec`.

embedding-idf
~~~~~~~~~~~~~

Feature extraction method where the average of the word embeddings are taken of words in the
text, multiplied by the inverse document frequency of said words.

See :class:`asreview.feature_extraction.EmbeddingIdf`.

embedding-lstm
~~~~~~~~~~~~~~

Feature extraction method for `LSTM/RNN <models.html#lstm-base>`__ models.

See :class:`asreview.feature_extraction.EmbeddingLSTM`

sbert
~~~~~

Feature extraction method based on Sentence BERT. Install the
`sentence_transformers <https://github.com/UKPLab/sentence-transformers>`__ package
in order to use it. It is relatively slow.

.. code:: bash

	pip install sentence_transformers

See :class:`asreview.feature_extraction.SBERT`


Classiers
---------

There are several machine learning classifiers implemented. At the moment of writing, one of the best performing classfiers is the Naive Bayes classifier.

Parameters should be under the section ``[model_param]``.

nb
~~

SKLearn Naive Bayes model. Only works in combination with the
`tfidf <feature_extraction.html#tfidf>`__ feature extraction
model. Though relatively simplistic, seems to work quite well on a wide range of datasets.

See :class:`asreview.models.NBModel`

svm
~~~

SKLearn Support Vector Machine algorithm.

See :class:`asreview.models.SVMModel`

rf
~~

SKLearn Random Forest model.

See :class:`asreview.models.RFModel`


logistic
~~~~~~~~

SKLearn Logistic regression model.

See :class:`asreview.models.LogisticModel`


nn-2-layer
~~~~~~~~~~

Neural network consisting of 2 equal size layers. Recommended feature
extraction model is `doc2vec <feature_extraction.html#doc2vec>`__. Might crash on some systems with limited memory in combination
with `tfidf <feature_extraction.html#tfidf>`__.

See :class:`asreview.models.NN2LayerModel`


lstm-base
~~~~~~~~~

LSTM model that consists of an embedding layer, LSTM layer with one
output, dense layer, and a single sigmoid output node. Use the
`embedding-lstm <feature_extraction.html#embedding-lstm>`__
feature extraction method. Currently not so well optimized and slow.

See :class:`asreview.models.LSTMBaseModel`

lstm-pool
~~~~~~~~~

LSTM model that consists of an embedding layer, LSTM layer with many
outputs, max pooling layer, and a single sigmoid output node. Use the
`embedding-lstm <feature_extraction.html#embedding-lstm>`__
feature extraction method. Currently not so well optimized and slow.

See :class:`asreview.models.LSTMPoolModel`

Query Strategies
----------------

There are several query strategies available.

Parameters should be under the section ``[query_param]``.

random
~~~~~~

As it says: randomly select samples with no regard to model assigned
probabilities. Warning: selecting this option means your review is not going to be
accelerated by ASReview.

See :class:`asreview.query_strategies.RandomQuery`


uncertainty
~~~~~~~~~~~

Choose the most uncertain samples according to the model (i.e. closest
to 0.5 probability). Doesn’t work very well in the case of
LSTM’s, since the probabilities are rather arbitrary.

See :class:`asreview.query_strategies.UncertaintyQuery`

max
~~~

Choose the most likely samples to be included according to the model.

See :func:`asreview.query_strategies.MaxQuery`

cluster
~~~~~~~

Use clustering after feature extraction on the dataset. Then the highest probabilities
within random clusters are sampled.

See :class:`asreview.query_strategies.ClusterQuery`

mixed
~~~~~

A mix of two query strategies is used. For example mixing max and random sampling
with a mix ratio of 0.95 would mean that at each query 95% of the instances would be
sampled with the max query strategy after which the remaining 5% would be sampled with
the random query strategy. It would be called the `max_random` query strategy. Every
combination of primitive query strategy is possible.

See :class:`asreview.query_strategies.MixedQuery`


Balance Strategies
------------------

There are several balance strategies that rebalance and reorder the
training data. This is sometimes necessary, because the data is often
very inbalanced: there are many more papers that should be excluded than
included (otherwise, automation cannot help much anyway).

Parameters in the config file should be under the section
``[balance_param]``.

We have currently implemented the following balance strategies:

simple
~~~~~~

Use all training data.

See :class:`asreview.balance_strategies.SimpleBalance`

undersample
~~~~~~~~~~~


This undersamples the data, leaving out excluded papers so that the
included and excluded papers are in some particular ratio (closer to
one). Configuration options are as follows:

.. code:: ini

   # Set the ratio of included/excluded to 1
   ratio=1.0

See :class:`asreview.balance_strategies.UndersampleBalance`

triple
~~~~~~

This divides the training data into three sets: included papers,
excluded papers found with random sampling and papers found with max
sampling. They are balanced according to formulas depending on the
percentage of papers read in the dataset, the number of papers with
random/max sampling etc. Works best for stochastic training algorithms.
Reduces to both full sampling and undersampling with corresponding
parameters.

.. code:: ini

 	a=2.155
 	alpha=0.94
 	b=0.789
 	beta=1.0
 	max_c=0.835
 	max_gamma=2.0
 	shuffle=True

See :class:`asreview.balance_strategies.TripleBalance`

double
~~~~~~

Same as triple balance, except that it distinguish between max or random
sampling.

.. code:: ini

	a=2.155
	alpha=0.94
	b=0.789
	beta=1.0

See :class:`asreview.balance_strategies.DoubleBalance`


