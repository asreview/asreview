.. _api_ref:

=============
API Reference
=============


.. automodule:: asreview

Data and datasets
=================

.. automodule:: asreview.data

.. currentmodule:: asreview

Read data
---------

.. autosummary::
   :toctree: generated/

   load_data
   ASReviewData


Statistics
----------

.. autosummary::
   :toctree: generated/

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
   :toctree: generated/

   asreview.datasets.SynergyDataGroup
   asreview.datasets.NaturePublicationDataGroup

Dataset managers
~~~~~~~~~~~~~~~~

.. autosummary::
   :toctree: generated/

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
   :toctree: generated/

   review.BaseReview
   review.ReviewSimulate


.. _ref-models:

Models
======

This section provides an overview of the available models for active learning
in ASReview. For command line usage, use the name (``example``) given behind
the model description (or see the name property of the model). Some models
require additional dependencies, see the model class for more information and
instructions.

.. automodule:: asreview.models
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

Base class

.. autosummary::
   :toctree: generated/

   models.base.BaseModel

.. _ref-feature-extraction:

:mod:`asreview.models.feature_extraction`
-----------------------------------------

.. automodule:: asreview.models.feature_extraction
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models

Classes

.. autosummary::
   :toctree: generated/

   feature_extraction.base.BaseFeatureExtraction
   feature_extraction.Tfidf
   feature_extraction.Doc2Vec
   feature_extraction.EmbeddingIdf
   feature_extraction.EmbeddingLSTM
   feature_extraction.SBERT

Functions

.. autosummary::
   :toctree: generated/

   feature_extraction.get_feature_model
   feature_extraction.get_feature_class
   feature_extraction.list_feature_extraction

.. _ref-classifiers:

:mod:`asreview.models.classifiers`
----------------------------------

.. automodule:: asreview.models.classifiers
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.models

Classes

.. autosummary::
   :toctree: generated/

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
   :toctree: generated/

   classifiers.get_classifier
   classifiers.get_classifier_class
   classifiers.list_classifiers



.. _ref-query-strategies:

:mod:`asreview.models.query`
----------------------------

.. automodule:: asreview.models.query
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models

Classes

.. autosummary::
   :toctree: generated/

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
   :toctree: generated/

   query.get_query_model
   query.get_query_class
   query.list_query_strategies


.. _ref-balance-strategies:

:mod:`asreview.models.balance`
------------------------------

.. automodule:: asreview.models.balance
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.models

Classes

.. autosummary::
   :toctree: generated/

   balance.base.BaseBalance
   balance.SimpleBalance
   balance.DoubleBalance
   balance.TripleBalance
   balance.UndersampleBalance


Functions

.. autosummary::
   :toctree: generated/

   balance.get_balance_model
   balance.get_balance_class
   balance.list_balance_strategies





Projects and States
===================

Load, interact, and extract information from project files and states (the
"diary" of the review).

.. automodule:: asreview.project
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :toctree: generated/

ASReviewProject
---------------

.. autosummary::
   :toctree: generated/

   ASReviewProject

State
-----

.. automodule:: asreview.state
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :toctree: generated/

   open_state
   state.SQLiteState


Utils
-----

.. autosummary::
   :toctree: generated/

   project.get_project_path
   project.project_from_id
   project.get_projects
   project.is_project
   project.is_v0_project


Readers and writers
===================

This module contains the input and output functionality. You can install them as extensions.


.. currentmodule:: asreview

.. autosummary::
   :toctree: generated/

   asreview.list_readers
   asreview.list_writers

.. automodule:: asreview.io
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :toctree: generated/

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

.. currentmodule:: asreview

Classes

.. autosummary::
   :toctree: generated/

   asreview.settings.ASReviewSettings

Functions

.. autosummary::
   :toctree: generated/

   search.fuzzy_find
   asreview_path
   get_data_home


Entry points
============

Entry points for ASReview LAB.


.. automodule:: asreview.entry_points
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :toctree: generated/

   entry_points.BaseEntryPoint
   entry_points.AlgorithmsEntryPoint
   entry_points.LABEntryPoint
   entry_points.SimulateEntryPoint
   entry_points.StateInspectEntryPoint
