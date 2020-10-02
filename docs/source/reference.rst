
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

Models
------

.. autoclass:: asreview.models.NBModel
   :members:
   :inherited-members:
.. autoclass:: asreview.models.RFModel
   :members:
   :inherited-members:
.. autoclass:: asreview.models.SVMModel
   :members:
   :inherited-members:
.. autoclass:: asreview.models.LogisticModel
   :members:
   :inherited-members:
.. autoclass:: asreview.models.LSTMBaseModel
   :members:
   :inherited-members:
.. autoclass:: asreview.models.LSTMPoolModel
   :members:
   :inherited-members:
.. autoclass:: asreview.models.NN2LayerModel
   :members:
   :inherited-members:
.. autofunction:: asreview.models.get_model
.. autofunction:: asreview.models.get_model_class


Query strategies
----------------

.. autoclass:: asreview.query_strategies.MaxQuery
   :members:
   :inherited-members:
.. autoclass:: asreview.query_strategies.MixedQuery
   :members:
   :inherited-members:
.. autoclass:: asreview.query_strategies.UncertaintyQuery
   :members:
   :inherited-members:
.. autoclass:: asreview.query_strategies.RandomQuery
   :members:
   :inherited-members:
.. autoclass:: asreview.query_strategies.ClusterQuery
   :members:
   :inherited-members:
.. autofunction:: asreview.query_strategies.get_query_model
.. autofunction:: asreview.query_strategies.get_query_class


Balance Strategies
------------------

.. autoclass:: asreview.balance_strategies.SimpleBalance
   :members:
   :inherited-members:
.. autoclass:: asreview.balance_strategies.DoubleBalance
   :members:
   :inherited-members:
.. autoclass:: asreview.balance_strategies.TripleBalance
   :members:
   :inherited-members:
.. autoclass:: asreview.balance_strategies.UndersampleBalance
   :members:
   :inherited-members:
.. autofunction:: asreview.balance_strategies.get_balance_model
.. autofunction:: asreview.balance_strategies.get_balance_class


Feature Extraction
------------------

.. autoclass:: asreview.feature_extraction.Tfidf
   :members:
   :inherited-members:
.. autoclass:: asreview.feature_extraction.Doc2Vec
   :members:
   :inherited-members:
.. autoclass:: asreview.feature_extraction.EmbeddingIdf
   :members:
   :inherited-members:
.. autoclass:: asreview.feature_extraction.EmbeddingLSTM
   :members:
   :inherited-members:
.. autoclass:: asreview.feature_extraction.SBERT
   :members:
   :inherited-members:
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
