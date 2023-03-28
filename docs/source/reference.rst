.. _api_ref:

=============
API Reference
=============


.. automodule:: asreview

Data and datasets
=================

.. automodule:: asreview.lib.data

.. currentmodule:: asreview.lib

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

.. automodule:: asreview.lib.datasets
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview


.. autosummary::
   :toctree: generated/

   asreview.lib.datasets.BenchmarkDataGroup
   asreview.lib.datasets.NaturePublicationDataGroup

Dataset managers
~~~~~~~~~~~~~~~~

.. autosummary::
   :toctree: generated/

   asreview.lib.datasets.BaseDataSet
   asreview.lib.datasets.BaseDataGroup
   asreview.lib.datasets.DatasetManager


Reviewer
========

.. automodule:: asreview.lib.review
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.lib

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

.. automodule:: asreview.lib.models
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.lib

Base class

.. autosummary::
   :toctree: generated/

   models.base.BaseModel

.. _ref-feature-extraction:

:mod:`asreview.lib.models.feature_extraction`
---------------------------------------------

.. automodule:: asreview.lib.models.feature_extraction
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.lib.models

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

:mod:`asreview.lib.models.classifiers`
--------------------------------------

.. automodule:: asreview.lib.models.classifiers
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.lib.models

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

:mod:`asreview.lib.models.query`
--------------------------------

.. automodule:: asreview.lib.models.query
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.lib.models

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

:mod:`asreview.lib.models.balance`
----------------------------------

.. automodule:: asreview.lib.models.balance
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.lib.models

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

.. automodule:: asreview.lib.project
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

.. autosummary::
   :toctree: generated/

ASReviewProject
---------------

.. currentmodule:: asreview.lib


.. autosummary::
   :toctree: generated/

   ASReviewProject

State
-----

.. automodule:: asreview.lib.state
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.lib

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
   project.list_asreview_projects
   project.is_project
   project.is_v0_project


Readers and writers
===================

This module contains the input and output functionality. You can install them as extensions.


.. currentmodule:: asreview.lib

.. autosummary::
   :toctree: generated/

   list_readers
   list_writers

.. automodule:: asreview.lib.io
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview.lib.io

.. autosummary::
   :toctree: generated/

   CSVReader
   CSVWriter
   ExcelReader
   ExcelWriter
   PaperRecord
   RISReader
   RISWriter
   TSVWriter

Misc
====

.. currentmodule:: asreview.lib

Classes

.. autosummary::
   :toctree: generated/

   settings.ASReviewSettings

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

