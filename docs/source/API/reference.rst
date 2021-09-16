.. _api_ref:

=============
API Reference
=============

This is the ASReview API Reference.







:mod:`asreview.analysis`
======================
This module deals with analysis.


.. automodule:: asreview.analysis
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   analysis.Analysis

Utils
-----
.. currentmodule:: asreview

.. autosummary::
   :toctree: generated/
   :template: function.rst

   analysis.statistics._find_inclusions
   analysis.statistics._get_labeled_order
   analysis.statistics._get_last_proba_order
   analysis.statistics._get_proba_order
   analysis.statistics._n_false_neg
   analysis.statistics._get_limits







:mod:`asreview.data`
====================
This module deals with handling data loading and storing.


.. automodule:: asreview.data
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   data.base.ASReviewData

Utils
-----
.. currentmodule:: asreview

.. autosummary::
   :toctree: generated/
   :template: function.rst

   data.statistics.n_records
   data.statistics.n_relevant
   data.statistics.n_irrelevant
   data.statistics.n_unlabeled
   data.statistics.n_missing_title
   data.statistics.n_missing_abstract
   data.statistics.title_length
   data.statistics.abstract_length
   data.statistics.n_keywords
   data.utils.load_data







:mod:`asreview.entry_points`
======================
This module deals with ASReview entry points.

[todo]


:mod:`asreview.io`
======================
This module deals with ASReview entry points.

[todo]






:mod:`asreview.models`
======================
This module contains the four model types.

.. automodule:: asreview.models
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   models.base.BaseModel







:mod:`asreview.models.balance`
==================================
This module contains all Balancers

.. automodule:: asreview.models.classifiers
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   balance.base.BaseBalance

Classes
-------
.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   balance.SimpleBalance
   balance.DoubleBalance
   balance.TripleBalance
   balance.UndersampleBalance

Utils
-----
.. currentmodule:: asreview.models

.. autosummary::
   :toctree: generated/
   :template: function.rst

   balance.utils.list_balance_strategies
   balance.utils.get_balance_model
   balance.utils.get_balance_class







:mod:`asreview.models.classifiers`
==================================
This module contains all classifiers.

.. automodule:: asreview.models.classifiers
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   classifiers.base.BaseTrainClassifier

Classes
-------
.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   classifiers.NaiveBayesClassifier
   classifiers.RandomForestClassifier
   classifiers.SVMClassifier
   classifiers.LogisticClassifier
   classifiers.LSTMBaseClassifier
   classifiers.LSTMPoolClassifier
   classifiers.NN2LayerClassifier

Utils
-----
.. currentmodule:: asreview.models

.. autosummary::
   :toctree: generated/
   :template: function.rst

   classifiers.utils.list_classifiers
   classifiers.utils.get_classifier
   classifiers.utils.get_classifier_class







:mod:`asreview.models.feature_extraction`
=========================================
This module contains all feature extractors.

.. automodule:: asreview.models.feature_extraction
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models.feature_extraction

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   base.BaseFeatureExtraction

Classes
-------
.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   feature_extraction.Tfidf
   feature_extraction.Doc2Vec
   feature_extraction.EmbeddingIdf
   feature_extraction.EmbeddingLSTM
   feature_extraction.SBERT


:mod:`asreview.models.feature_extraction.utils`
-----

.. currentmodule:: asreview.models.feature_extraction

.. autosummary::
   :toctree: generated/
   :template: function.rst

   utils.list_feature_extraction
   utils.get_feature_model
   utils.get_feature_class







:mod:`asreview.models.query`
=========================================
This Module contains all query strategies.

.. automodule:: asreview.models.query
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   query.BaseQueryStrategy

Classes
-------
.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   query.MaxQuery
   query.UncertaintyQuery
   query.RandomQuery
   query.ClusterQuery
   query.MaxRandomQuery
   query.MaxUncertaintyQuery

Utils
-----
.. currentmodule:: asreview.models

.. autosummary::
   :toctree: generated/
   :template: function.rst

   query.list_query_strategies
   query.get_query_model
   query.get_query_class







:mod:`asreview.state`
=====================
This module handles the ASReview file

.. automodule:: asreview.state
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   state.BaseState

Classes
-------
.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

	state.HDF5State
   state.JSONState
   state.DictState

Utils
-----
.. currentmodule:: asreview

.. autosummary::
   :toctree: generated/
   :template: function.rst

   state._get_state_class
   state.open_state
   state.states_from_dir
   state.state_from_file
   state.state_from_asreview_file

