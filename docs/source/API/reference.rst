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


:mod:`asreview.analysis.statistics`
-----------------------------------
.. currentmodule:: asreview.analysis

.. autosummary::
   :toctree: generated/
   :template: function.rst

   statistics._find_inclusions
   statistics._get_labeled_order
   statistics._get_last_proba_order
   statistics._get_proba_order
   statistics._n_false_neg
   statistics._get_limits







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

:mod:`asreview.data.statistics`
-------------------------------
.. currentmodule:: asreview.data

.. autosummary::
   :toctree: generated/
   :template: function.rst

   statistics.n_records
   statistics.n_relevant
   statistics.n_irrelevant
   statistics.n_unlabeled
   statistics.n_missing_title
   statistics.n_missing_abstract
   statistics.title_length
   statistics.abstract_length
   statistics.n_keywords

:mod:`asreview.data.utils`
--------------------------
.. currentmodule:: asreview.data

.. autosummary::
   :toctree: generated/
   :template: function.rst

   utils.load_data







:mod:`asreview.entry_points`
============================

[todo]


:mod:`asreview.io`
==================

[todo]






:mod:`asreview.models`
======================
This module contains the base model class.

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
------------------------------
This module contains all Balancer models.

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
#######

.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   balance.SimpleBalance
   balance.DoubleBalance
   balance.TripleBalance
   balance.UndersampleBalance

:mod:`asreview.models.balance.utils`
####################################

.. currentmodule:: asreview.models.balance

.. autosummary::
   :toctree: generated/
   :template: function.rst

   utils.list_balance_strategies
   utils.get_balance_model
   utils.get_balance_class







:mod:`asreview.models.classifiers`
----------------------------------

This module contains all classifier models.

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
#######

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

:mod:`asreview.models.classifiers.utils`
########################################

.. currentmodule:: asreview.models.classifiers

.. autosummary::
   :toctree: generated/
   :template: function.rst

   utils.list_classifiers
   utils.get_classifier
   utils.get_classifier_class







:mod:`asreview.models.feature_extraction`
-----------------------------------------

This module contains all feature extractor models.

.. automodule:: asreview.models.feature_extraction
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   feature_extraction.base.BaseFeatureExtraction

Classes
#######

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
###############################################

.. currentmodule:: asreview.models.feature_extraction

.. autosummary::
   :toctree: generated/
   :template: function.rst

   utils.list_feature_extraction
   utils.get_feature_model
   utils.get_feature_class







:mod:`asreview.models.query`
----------------------------

This Module contains all query strategy models.

.. automodule:: asreview.models.query
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: class.rst

   query.base.BaseQueryStrategy

Classes
#######

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

:mod:`asreview.models.query.utils`
##################################

.. currentmodule:: asreview.models.query

.. autosummary::
   :toctree: generated/
   :template: function.rst

   utils.list_query_strategies
   utils.get_query_model
   utils.get_query_class



:mod:`asreview.review`
======================
[todo]



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

   state.base.BaseState

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

:mod:`asreview.state.utils`
----------------------------------
.. currentmodule:: asreview.state

.. autosummary::
   :toctree: generated/
   :template: function.rst

   utils._get_state_class
   utils.open_state
   utils.states_from_dir
   utils.state_from_file
   utils.state_from_asreview_file

autosummary recursive
=====================
Some words.

.. autosummary::
   :toctree: _autosummary
   :recursive:

   asreview