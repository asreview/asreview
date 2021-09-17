.. _api_ref:

=============
API Reference
=============

Welcome to the ASReview API.



:mod:`asreview.analysis`
========================

This module contains the ASReview analysis functionality.

.. automodule:: asreview.analysis
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   :recursive:

   analysis.analysis
   analysis.statistics



:mod:`asreview.data`
====================

This module contains the data handling.

.. automodule:: asreview.data
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   :recursive:

   data.base
   data.statistics
   data.utils



:mod:`asreview.entry_points`
============================

This module contains the ASReview entry point handling.

.. automodule:: asreview.entry_points
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   :recursive:

   entry_points.base
   entry_points.algorithms
   entry_points.lab
   entry_points.simulate



:mod:`asreview.io`
==================

This module contains the base model class.

.. automodule:: asreview.io
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   :recursive:

   io.csv_reader
   io.excel_reader
   io.paper_record
   io.pubmed_xml_reader
   io.ris_reader
   io.utils



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
   :template: custom-module-template.rst
   :recursive:

   models.base


:mod:`asreview.models.balance`
------------------------------

This module contains all Balancer models.

.. automodule:: asreview.models.balance
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.models

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   :recursive:
   
   balance.base
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
   :template: custom-module-template.rst
   :recursive:
   
   classifiers.base
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
   :template: custom-module-template.rst
   :recursive:
   
   feature_extraction.base
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
   :template: custom-module-template.rst
   :recursive:
   
   query.base
   query.MaxQuery
   query.UncertaintyQuery
   query.RandomQuery
   query.ClusterQuery
   query.MaxRandomQuery
   query.MaxUncertaintyQuery
   query.utils



:mod:`asreview.review`
======================

This module handles ASReview.

.. automodule:: asreview.review
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   :recursive:
   
   review.base
   review.factory
   review.minimal
   review.simulate




:mod:`asreview.state`
=====================

This module handles the ASReview file.

.. automodule:: asreview.state
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   :recursive:
   
   state.base
	state.HDF5State
   state.JSONState
   state.DictState
   state.utils