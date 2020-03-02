Feature Extraction
==================

Feature extraction is the process of converting a list of texts into some kind
of feature matrix. 

Parameters in the config file should be under the section
``[feature_param]``.

We have currently implemented the following feature extraction methods:

tfidf
-----


Use the standard TF-IDF (Term Frequency-Inverse Document Frequency) feature extraction
from `SKLearn <https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html>`__.

Gives a sparse matrix as output. Works well in combination with 
`Naive Bayes <models.html#nb>`__ and other
fast training models (given that the features vectors are relatively wide).

See :class:`asreview.feature_extraction.Tfidf`.

doc2vec
-------

Feature extraction method provided by the `gensim <https://radimrehurek.com/gensim/>`__ package.
To use it, please install the gensim package manually:

.. code:: bash

	pip install gensim

It takes relatively long to create a feature matrix with this method. However, this only has
to be done once per simulation/review. The upside of this method is the dimension-reduction
that generally takes place, which makes the modelling quicker.

See :class:`asreview.feature_extraction.Doc2Vec`.

embedding-idf
-------------

Feature extraction method where the average of the word embeddings are taken of words in the
text, multiplied by the inverse document frequency of said words.

See :class:`asreview.feature_extraction.EmbeddingIdf`.

embedding-lstm
--------------

Feature extraction method for `LSTM/RNN <models.html#lstm-base>`__ models.

See :class:`asreview.feature_extraction.EmbeddingLSTM`

sbert
-----

Feature extraction method based on Sentence BERT. Install the
`sentence_transformers <https://github.com/UKPLab/sentence-transformers>`__ package
in order to use it. It is relatively slow.

.. code:: bash

	pip install sentence_transformers

See :class:`asreview.feature_extraction.SBERT`
