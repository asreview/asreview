.. _api_ref:

=============
API Reference
=============

Data and datasets
=================

.. automodule:: asreview.data
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

Read data
---------

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   ASReviewData
   load_data


Statistics
----------

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   data.statistics.abstract_length
   data.statistics.n_duplicates
   data.statistics.n_irrelevant
   data.statistics.n_keywords
   data.statistics.n_missing_abstract
   data.statistics.n_missing_title
   data.statistics.n_records
   data.statistics.n_relevant
   data.statistics.n_unlabeled
   data.statistics.title_length


Datasets
--------

Available datasets
~~~~~~~~~~~~~~~~~~

.. automodule:: asreview.datasets
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview


.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   asreview.datasets.BenchmarkDataGroup
   asreview.datasets.NaturePublicationDataGroup

Utils
~~~~~

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   asreview.datasets.BaseDataSet
   asreview.datasets.BaseDataGroup
   asreview.datasets.DatasetManager


Reviewer
========

.. automodule:: asreview.review
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   review.BaseReview
   review.ReviewSimulate


Models
======

.. automodule:: asreview.models
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

Base class

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   models.base.BaseModel


:mod:`asreview.models.balance`
------------------------------

.. automodule:: asreview.models.balance
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.models

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   balance.base.BaseBalance
   balance.SimpleBalance
   balance.DoubleBalance
   balance.TripleBalance
   balance.UndersampleBalance


Functions

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   balance.get_balance_model
   balance.get_balance_class
   balance.list_balance_strategies


:mod:`asreview.models.classifiers`
----------------------------------

.. automodule:: asreview.models.classifiers
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.models

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   classifiers.base.BaseTrainClassifier
   classifiers.NaiveBayesClassifier
   classifiers.RandomForestClassifier
   classifiers.SVMClassifier
   classifiers.LogisticClassifier
   classifiers.LSTMBaseClassifier
   classifiers.LSTMPoolClassifier
   classifiers.NN2LayerClassifier

Functions

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   classifiers.get_classifier
   classifiers.get_classifier_class
   classifiers.list_classifiers


:mod:`asreview.models.feature_extraction`
-----------------------------------------

.. automodule:: asreview.models.feature_extraction
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   feature_extraction.base.BaseFeatureExtraction
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

.. automodule:: asreview.models.query
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   query.base.BaseQueryStrategy
   query.base.ProbaQueryStrategy
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


Projects and States
===================

Load, interact, and extract information from project files and states (the
"diary" of the review).

.. automodule:: asreview.project
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

ASReviewProject
---------------

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   ASReviewProject

State
-----

.. automodule:: asreview.state
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   open_state
   state.SQLiteState


Utils
-----

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   project.get_project_path
   project.project_from_id
   project.list_asreview_projects
   project.is_project
   project.is_v0_project


Readers and writers
===================

This module contains the input and output functionality. You can install them as extensions.


.. automodule:: asreview
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst

   asreview.list_readers
   asreview.list_writers

.. automodule:: asreview.io
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   io.CSVReader
   io.CSVWriter
   io.ExcelReader
   io.ExcelWriter
   io.PaperRecord
   io.RISReader
   io.RISWriter
   io.TSVWriter

Misc
====

.. automodule:: asreview
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   asreview.settings.ASReviewSettings

Functions

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-module-template.rst

   asreview.search.fuzzy_find
   asreview.asreview_path
   asreview.get_data_home


Entry points
============

Entry points for ASReview LAB.


.. automodule:: asreview.entry_points
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   entry_points.BaseEntryPoint
   entry_points.AlgorithmsEntryPoint
   entry_points.LABEntryPoint
   entry_points.SimulateEntryPoint
   entry_points.StateInspectEntryPoint

