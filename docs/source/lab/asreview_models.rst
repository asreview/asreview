ASReview Models
###############

The AI model is the engine that powers your systematic review. It learns from your decisions
to identify relevant records and accelerate your review process. ASReview offers two types of
models, both provide models and the option to create a custom model:

- ELAS Models: These models are fast and efficient for most reviews. They are included by default when you install ASReview.
- Heavy Models: These are more specialised and computationally demanding. To use these models you require the official `asreview-nemo <https://github.com/asreview/asreview-nemo>`__ extension.

ELAS Models
***********
The base models are included in the ASReview package and are all you need for most users. We offer
one model which was trained on the SYNERGY dataset and works well for most use cases. However, if
you want to compare different models you are free to mix and match feature extractors, classifiers,
queriers, and balancers.

Ultra
=====
.. tip::

  To get started quickly, choose the ELAS u4 model.

The best performing model in ASReview yet! ELAS u4 is a combination of the TF-IDF feature extractor
and the Support Vector Machine (SVM) classifier. This, combined with the Maximum querier and the
Balanced balancer and optimized hyperparameters on the SYNERGY dataset, provides you with a great model.

Custom ELAS Models
==================
Since an AI model is a combination of four model components that work together to rank your remaining
documents, you can create a custom model as well. The four model components that you can choose are are:

- Querier: Selects which records to show you next. For example, prioritizing potentially relevant records or mixing in random records.
- Feature Extractor: Converts text into numerical features that the classifier can understand.
- Classifier: Makes predictions about relevance based on your decisions using the numerical features created by the feature extractor.
- Balancer: Handles imbalanced data to improve learning accuracy.

The following options work out of the box, but if you are up for a challenge you can implement any
classifier or feature extractor yourself.

- Feature Extractors: `OneHot`, `TF-IDF`
- Classifiers: `Naive Bayes`, `Support Vector Machine`, `Random Forest`, `Logistic Regression`
- Queriers: `Maximum`, `Mixed (95% Maximum and 5% Random)`, `Mixed (95% Maximum and 5% Uncertainty)`, `Random`, `Top-down`, `Uncertainty`
- Balancers: `Balanced`

Heavy Models
************
.. note::

  This is an official extension for ASReview. See `asreview-nemo <https://github.com/asreview/asreview-nemo>`__
  for the repository.

ASReview New Exciting MOdels (NEMO) is a Python package that, when installed, offers ASReview users
access to newer, larger, and more advanced models. Having these models in a separate Python package
allows you to experiment with newer and more complex models, whilst at the same time keeping the
ASReview package lightweight and fast!

Installation
============
Installing ASReview NEMO works like any other Python package. Simply install NEMO using the following command:

.. code:: bash

	pip install asreview-nemo

After installation, the ASReview NEMO models are available in two models: l2, for multilingual datasets, and
h4, for learning on semantics from your dataset. Moreover, under Custom you can mix and match even more
feature extractors and classifiers.

.. tip::
  Since these models are generally more computationally intense,
  it can take a while for the feature extractorand classifier to
  process your data. You can keep track of the progress in the
  command line that you used to start ASReview LAB.

Multilingual
============
The ELAS l2 model is specifically meant for datasets that contain multiple languages. It uses the
`multilingual-e5-large` feature extractor, combined with the SVM classifier.

Heavy
=====
The ELAS h3 model is perfect for you if you want to screen your dataset from a different angle. Where
TF-IDF counts word occurrences, ELAS h3 uses the `mxbai-embed-large-v1` feature extractor which is
trained to focus more on the underlying semantics of the text. This feature extractor is combined with
the SVM classifier.

Custom Heavy Models
===================
You can also create any model you want by combining ASReview and NEMO model components in a custom model.
The following feature extractors and classifiers are currently included in the NEMO package.

ASReview NEMO Feature Extractors: `doc2vec`, `gtr-t5-large`, `labse`, `multilingual-e5-large`,
`mxbai-embed-large-v1`, `sbert`

ASReview NEMO Classifiers: `AdaBoost`, `Neural Network - 2-Layer`, `Neural Network - Dynamic`,
`Neural Network - Warm Start`, `XGBoost`

.. tip::
  Combining ASReview and NEMO models in a custom model requires some knowledge of how these models work.
  Some feature extractors produce features that do not work with some classifiers. An example of this is
  any NEMO feature extractor cannot be combined with the ASReview Naive Bayes classifier.
