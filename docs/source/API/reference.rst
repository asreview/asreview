.. _api_ref:

=============
API Reference
=============

Welcome to the ASReview API.



:mod:`asreview`
===============

This contains separate ASReview modules.

.. automodule:: asreview
   :no-members:
   :no-inherited-members:

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   
   asreview.datasets
   asreview.init_sampling
   asreview.search
   asreview.types
   asreview.utils



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
   

   io.csv_reader
   io.excel_reader
   io.paper_record
   io.pubmed_xml_reader
   io.ris_reader
   io.utils


.. the underlying part could also be done with :recursive:, but it turned out a bit unruly.


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
   
   
   balance.base
   balance.simple
   balance.double
   balance.triple
   balance.undersample
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
   
   
   classifiers.base
   classifiers.nb
   classifiers.rf
   classifiers.svm
   classifiers.logistic
   classifiers.lstm_base
   classifiers.lstm_pool
   classifiers.nn_2_layer
   classifiers.utils



:mod:`asreview.models.feature_extraction`
-----------------------------------------

This module contains all feature extractor models.

.. automodule:: asreview.models.feature_extraction
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models

Modules

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   
   feature_extraction.base

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

	feature_extraction.Tfidf
	feature_extraction.Doc2Vec
	feature_extraction.EmbeddingIdf
	feature_extraction.EmbeddingLSTM
	feature_extraction.SBERT

Functions

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

	feature_extraction.get_feature_model
	feature_extraction.get_feature_class
	feature_extraction.list_feature_extraction



:mod:`asreview.models.query`
----------------------------

This Module contains all query strategy models.

.. automodule:: asreview.models.query
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models

Modules

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   
   query.base

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   query.MaxQuery
   query.MixedQuery
   query.MaxRandomQuery
   query.MaxUncertaintyQuery
   query.UncertaintyQuery
   query.RandomQuery
   query.ClusterQuery

Functions

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   query.get_query_model
   query.get_query_class
   query.list_query_strategies



:mod:`asreview.review`
======================

This module handles ASReview.

.. automodule:: asreview.review
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

Modules

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst
   
   review.base
   review.factory

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst
   
   review.simulate.ReviewSimulate
   asreview.review.MinimalReview


Functions

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst




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
   
   
   state.base
	state.dict
   state.hdf5
   state.dict
   state.utils


   
