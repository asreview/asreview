.. _api_ref:

=============
API Reference
=============

This is the ASReview API Reference.







:mod:`asreview.analysis`
========================

[todo]

:mod:`asreview.data`
====================

[todo]

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

   models.base

      .. autosummary::
         :nosignatures:
         :toctree: generated/
         
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
   :recursive:
   
   balance.base.BaseBalance
   balance.SimpleBalance
   balance.DoubleBalance
   balance.TripleBalance
   balance.UndersampleBalance
   balance.utils



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
   :recursive:
   
   classifiers.base.BaseTrainClassifier
   classifiers.NaiveBayesClassifier
   classifiers.RandomForestClassifier
   classifiers.SVMClassifier
   classifiers.LogisticClassifier
   classifiers.LSTMBaseClassifier
   classifiers.LSTMPoolClassifier
   classifiers.NN2LayerClassifier
   classifiers.utils



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
   :recursive:
   
   feature_extraction.base.BaseFeatureExtraction
   feature_extraction.Tfidf
   feature_extraction.Doc2Vec
   feature_extraction.EmbeddingIdf
   feature_extraction.EmbeddingLSTM
   feature_extraction.SBERT
   feature_extraction.utils



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
   :recursive:
   
   query.base
   query.base.BaseQueryStrategy
   query.base.ProbaQueryStrategy
   query.base.NotProbaQueryStrategy
   query.MaxQuery
   query.UncertaintyQuery
   query.RandomQuery
   query.ClusterQuery
   query.MaxRandomQuery
   query.MaxUncertaintyQuery
   query.utils



:mod:`asreview.review`
======================

[todo] idk what exactly this does

.. automodule:: asreview.review
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :recursive:
   
   review.base
   review.base.BaseReview
   review.factory
   review.minimal
   review.minimal.MinimalReview
   review.simulate
   review.simulate.ReviewSimulate




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
   :recursive:
   
   state.base
   state.base.BaseState
	state.HDF5State
   state.JSONState
   state.DictState
   state.utils