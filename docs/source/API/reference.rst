
API Reference
=============

.. toctree::
   :maxdepth: 2
   :caption: Contents:

Low level API
-------------

.. autoclass:: asreview.review.BaseReview
   :members:

.. autoclass:: asreview.ReviewSimulate
   :members:
   :inherited-members:

Classifiers
-----------

.. autoclass:: asreview.models.classifiers.NaiveBayesClassifier
   :members:
   :inherited-members:
.. autoclass:: asreview.models.classifiers.RandomForestClassifier
   :members:
   :inherited-members:
.. autoclass:: asreview.models.classifiers.SVMClassifier
   :members:
   :inherited-members:
.. autoclass:: asreview.models.classifiers.LogisticClassifier
   :members:
   :inherited-members:
.. autoclass:: asreview.models.classifiers.LSTMBaseClassifier
   :members:
   :inherited-members:
.. autoclass:: asreview.models.classifiers.LSTMPoolClassifier
   :members:
   :inherited-members:
.. autoclass:: asreview.models.classifiers.NN2LayerClassifier
   :members:
   :inherited-members:
.. autofunction:: asreview.models.classifiers.list_classifiers
.. autofunction:: asreview.models.classifiers.get_classifier
.. autofunction:: asreview.models.classifiers.get_classifier_class


Query
-----

.. autoclass:: asreview.models.query.MaxQuery
   :members:
   :inherited-members:
.. autoclass:: asreview.models.query.UncertaintyQuery
   :members:
   :inherited-members:
.. autoclass:: asreview.models.query.RandomQuery
   :members:
   :inherited-members:
.. autoclass:: asreview.models.query.ClusterQuery
   :members:
   :inherited-members:
.. autoclass:: asreview.models.query.MixedQuery
   :members:
   :inherited-members:
.. autofunction:: asreview.models.query.list_query_strategies
.. autofunction:: asreview.models.query.get_query_model
.. autofunction:: asreview.models.query.get_query_class


Balance
-------

.. autoclass:: asreview.models.balance.SimpleBalance
   :members:
   :inherited-members:
.. autoclass:: asreview.models.balance.DoubleBalance
   :members:
   :inherited-members:
.. autoclass:: asreview.models.balance.TripleBalance
   :members:
   :inherited-members:
.. autoclass:: asreview.models.balance.UndersampleBalance
   :members:
   :inherited-members:
.. autofunction:: asreview.models.balance.list_balance_strategies
.. autofunction:: asreview.models.balance.get_balance_model
.. autofunction:: asreview.models.balance.get_balance_class


Feature extraction
------------------

.. autoclass:: asreview.models.feature_extraction.Tfidf
   :members:
   :inherited-members:
.. autoclass:: asreview.models.feature_extraction.Doc2Vec
   :members:
   :inherited-members:
.. autoclass:: asreview.models.feature_extraction.EmbeddingIdf
   :members:
   :inherited-members:
.. autoclass:: asreview.models.feature_extraction.EmbeddingLSTM
   :members:
   :inherited-members:
.. autoclass:: asreview.models.feature_extraction.SBERT
   :members:
   :inherited-members:
.. autofunction:: asreview.models.feature_extraction.list_feature_extraction
.. autofunction:: asreview.models.feature_extraction.get_feature_model
.. autofunction:: asreview.models.feature_extraction.get_feature_class



Data
----

.. autoclass:: asreview.ASReviewData
	:members:
      

Utils
-----

.. autofunction:: asreview.load_embedding
.. autofunction:: asreview.sample_embedding

State
-------

.. autofunction:: asreview.state.open_state
.. autoclass:: asreview.state.BaseState
	:members:
.. autoclass:: asreview.state.HDF5State
   :members:
   :inherited-members:
.. autoclass:: asreview.state.JSONState
   :members:
   :inherited-members:
.. autoclass:: asreview.state.DictState
   :members:
   :inherited-members:

Analysis
--------

.. autoclass:: asreview.analysis.Analysis
	:members:

Extensions
----------

.. autoclass:: asreview.entry_points.BaseEntryPoint
	:members:
