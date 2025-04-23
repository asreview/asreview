ASReview NEMO
#############

.. note::

  This is an official extension for ASReview. See `asreview-nemo <https://github.com/asreview/asreview-nemo>`__ for the repository.


Introduction
************
ASReview New Exciting MOdels (NEMO) is a Python package that, when installed, offers ASReview users 
access to newer, larger, and more advanced models. Having these models in a separate Python package
allows you to experiment with newer and more complex models, whilst at the same time keeping the
ASReview package lightweight and fast!

Installation
************
Installing ASReview NEMO works like any other Python package. Simply install NEMO using the following command:

.. code:: bash

	pip install asreview-nemo

Usage
******
After installation, the ASReview NEMO models are available in two presets: l2, for multilingual datasets, and 
h4, for learning on semantics from your dataset. Moreover, under Custom you can mix and match even more 
feature extractors and classifiers.

.. tip::
  Since these models are generally more computationally intense, 
  it can take a while for the feature extractorand classifier to 
  process your data. You can keep track of the progress in the 
  command line that you used to start ASReview LAB.

Currently Available NEMO models
*******************************

ASReview pre-sets

- ELAS l2: multilingual-e5-large + SVM
- ELAS h4: mxbai-embed-large-v1 + SVM

ASReview NEMO Feature Extractors

- doc2vec
- gtr-t5-large
- labse
- multilingual-e5-large
- mxbai-embed-large-v1
- sbert

ASReview NEMO Classifiers

- AdaBoost
- Neural Network - 2-Layer
- Neural Network - Dynamic
- Neural Network - Warm Start
- Scaled Naive Bayes
- XGBoost