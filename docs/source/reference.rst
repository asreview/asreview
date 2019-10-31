
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

.. autofunction:: asreview.models.create_lstm_base_model
.. autofunction:: asreview.models.create_lstm_pool_model
.. autofunction:: asreview.models.create_nb_model
.. autofunction:: asreview.models.create_svc_model

Query strategies
----------------

.. autofunction:: asreview.query_strategies.uncertainty_sampling
.. autofunction:: asreview.query_strategies.random_sampling
.. autofunction:: asreview.query_strategies.max_sampling
.. autofunction:: asreview.query_strategies.rand_max_sampling


Balance Strategies
------------------

.. autofunction:: asreview.balance_strategies.full_sample
.. autofunction:: asreview.balance_strategies.undersample
.. autofunction:: asreview.balance_strategies.triple_balance

Utils
-----

.. autofunction:: asreview.read_data
.. autofunction:: asreview.load_embedding
.. autofunction:: asreview.sample_embedding

Loggers
-------

.. autofunction:: asreview.logging.open_logger 
.. autoclass:: asreview.logging.BaseLogger
	:members:
.. autoclass:: asreview.logging.HDF5Logger
.. autoclass:: asreview.logging.JSONLogger
.. autoclass:: asreview.logging.DictLogger

Analysis
--------

.. autoclass:: asreview.analysis.Analysis
	:members: