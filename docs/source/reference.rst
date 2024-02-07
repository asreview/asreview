.. _api_ref:

=============
API Reference
=============


.. automodule:: asreview
   :members:
   :undoc-members:
   :show-inheritance:
   :inherited-members:


Models
------

Feature extraction
~~~~~~~~~~~~~~~~~~

.. automodule:: asreview.models.feature_extraction
   :no-members:
   :no-inherited-members:

.. currentmodule:: asreview.models

Classes

.. autosummary::
   :toctree: generated/

   feature_extraction.base.BaseFeatureExtraction
   feature_extraction.Tfidf


Functions

.. autosummary::
   :toctree: generated/

   feature_extraction.get_feature_model
   feature_extraction.get_feature_class
   feature_extraction.list_feature_extraction


Classifiers
~~~~~~~~~~~

.. automodule:: asreview.models.classifiers
   :members:
   :undoc-members:
   :show-inheritance:
   :inherited-members:


Classes

.. autosummary::
   :toctree: generated/

   classifiers.base.BaseTrainClassifier
   classifiers.NaiveBayesClassifier
   classifiers.RandomForestClassifier
   classifiers.SVMClassifier
   classifiers.LogisticClassifier

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
   :members:
   :undoc-members:
   :show-inheritance:
   :inherited-members:


Balance strategies
~~~~~~~~~~~~~~~~~~~

.. automodule:: asreview.models.balance
   :members:
   :undoc-members:
   :show-inheritance:
   :inherited-members:

State files
-----------

.. automodule:: asreview.state
   :members:
   :undoc-members:
   :show-inheritance:
   :inherited-members:

Simulation
----------

.. automodule:: asreview.simulation
   :members:
   :undoc-members:
   :show-inheritance:
   :inherited-members:


Data
----

.. automodule:: asreview.data
   :members:
   :undoc-members:
   :show-inheritance:
   :inherited-members:
