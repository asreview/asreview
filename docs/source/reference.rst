
Reference
===============================

.. toctree::
   :maxdepth: 2
   :caption: Contents:

Low level API 
-------------

.. autoclass:: asr.ReviewSimulate
   :members:

.. autoclass:: asr.ReviewOracle
   :members:

Models
------

.. autofunction:: asr.models.create_lstm_base_model
.. autofunction:: asr.models.create_lstm_pool_model
.. autofunction:: asr.models.create_nb_model
.. autofunction:: asr.models.create_svc_model

Query strategies
----------------

.. autofunction:: asr.query_strategies.uncertainty_sampling
.. autofunction:: asr.query_strategies.random_sampling
.. autofunction:: asr.query_strategies.max_sampling
.. autofunction:: asr.query_strategies.rand_max_sampling


Balance Strategies
------------------

.. autofunction:: asr.balance_strategies.full_sample
.. autofunction:: asr.balance_strategies.undersample
.. autofunction:: asr.balance_strategies.triple_balance

Utils
-----

.. autofunction:: asr.read_data

.. autofunction:: asr.load_embedding

.. autofunction:: asr.sample_embedding


