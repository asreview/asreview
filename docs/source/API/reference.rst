.. _api_ref:

=============
API Reference
=============

Welcome to the ASReview API. This API reference contains documentation on the
modules, classes, and functions of the ASReview software.



:mod:`asreview`
===============

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

   asreview.init_sampling.sample_prior_knowledge
   asreview.search.fuzzy_find
   asreview.types.type_n_queries
   asreview.utils.asreview_path
   asreview.utils.get_data_home
   asreview.utils.format_to_str
   asreview.utils.pretty_format
   asreview.utils.is_iterable
   asreview.utils.list_model_names
   asreview.utils.list_reader_names
   asreview.utils.list_writer_names
   asreview.utils.get_entry_points
   asreview.utils.is_url
   asreview.utils.get_random_state


:mod:`asreview.data`
====================

This module contains the data handling.

.. automodule:: asreview.data
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   data.ASReviewData

Functions

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   data.load_data
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


:mod:`asreview.entry_points`
====================

This module contains all ASReview entry points.

.. automodule:: asreview.entry_points
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   entry_points.BaseEntryPoint
   entry_points.AlgorithmsEntryPoint
   entry_points.LABEntryPoint
   entry_points.WebRunModelEntryPoint
   entry_points.SimulateEntryPoint
   entry_points.StateInspectEntryPoint


:mod:`asreview.io`
====================

This module contains the input and output functionality.

.. automodule:: asreview.io
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

Classes

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

Functions

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   io.list_readers
   io.list_writers
   io.utils.type_from_column
   io.utils.convert_keywords
   io.utils.type_from_column_spec
   io.utils.get_reader_class
   io.utils.get_writer_class


:mod:`asreview.models`
======================

.. automodule:: asreview.models
    :no-members:
    :no-inherited-members:

.. currentmodule:: asreview

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   models.base.BaseModel

Functions

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   models.get_classifier
   models.get_classifier_class


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


:mod:`asreview.review`
======================

.. automodule:: asreview.review
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   review.BaseReview
   review.ReviewSimulate


:mod:`asreview.project`
=======================

.. automodule:: asreview.project
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   project.ASReviewProject

Functions

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   project.get_project_path
   project.project_from_id
   project.list_asreview_projects
   project.is_project
   project.is_v0_project
   project.open_state


:mod:`asreview.state`
=====================

.. automodule:: asreview.state
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   state.BaseState
   state.SQLiteState



:mod:`asreview.datasets`
========================

.. automodule:: asreview.datasets
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview

Classes

.. autosummary::
   :nosignatures:
   :toctree: generated/
   :template: custom-class-template.rst

   asreview.datasets.BaseDataSet
   asreview.datasets.BaseDataGroup
   asreview.datasets.DatasetManager
   asreview.datasets.BenchmarkDataGroup
   asreview.datasets.NaturePublicationDataGroup