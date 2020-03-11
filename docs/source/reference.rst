
Reference
===============================

.. toctree::
   :maxdepth: 2
   :caption: Contents:

Low level API 
-------------

.. autofunction:: asreview.review.get_reviewer

.. autoclass:: asreview.review.BaseReview
   :members:

.. autoclass:: asreview.ReviewSimulate

.. autoclass:: asreview.ReviewOracle

Models
------

.. autoclass:: asreview.models.NBModel
.. autoclass:: asreview.models.RFModel
.. autoclass:: asreview.models.NN2LayerModel
.. autoclass:: asreview.models.SVMModel
.. autoclass:: asreview.models.LogisticModel
.. autoclass:: asreview.models.LSTMBaseModel
.. autoclass:: asreview.models.LSTMPoolModel
.. autofunction:: asreview.models.get_model
.. autofunction:: asreview.models.get_model_class


Query strategies
----------------

.. autoclass:: asreview.query_strategies.MaxQuery
.. autoclass:: asreview.query_strategies.MixedQuery
.. autoclass:: asreview.query_strategies.UncertaintyQuery
.. autoclass:: asreview.query_strategies.RandomQuery
.. autoclass:: asreview.query_strategies.ClusterQuery
.. autofunction:: asreview.query_strategies.get_query_model
.. autofunction:: asreview.query_strategies.get_query_class


Balance Strategies
------------------

.. autoclass:: asreview.balance_strategies.SimpleBalance
.. autoclass:: asreview.balance_strategies.DoubleBalance
.. autoclass:: asreview.balance_strategies.TripleBalance
.. autoclass:: asreview.balance_strategies.UndersampleBalance
.. autofunction:: asreview.balance_strategies.get_balance_model
.. autofunction:: asreview.balance_strategies.get_balance_class


Feature Extraction
------------------

.. autoclass:: asreview.feature_extraction.Doc2Vec
.. autoclass:: asreview.feature_extraction.Tfidf
.. autoclass:: asreview.feature_extraction.EmbeddingIdf
.. autoclass:: asreview.feature_extraction.SBERT
.. autofunction:: asreview.feature_extraction.get_feature_model
.. autofunction:: asreview.feature_extraction.get_feature_class



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
.. autoclass:: asreview.state.JSONState
.. autoclass:: asreview.state.DictState

Analysis
--------

.. autoclass:: asreview.analysis.Analysis
	:members:

Extensions
----------

.. autoclass:: asreview.entry_points.BaseEntryPoint
	:members: