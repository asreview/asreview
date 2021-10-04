Overview
========

ASReview has support for extensions, which are a nice way to extend the
functionality of the :doc:`ASReview LAB <../lab/overview_lab>` software or the
:doc:`command line interface <../API/cli>`. There are :ref:`officially
supported extensions<extensions-official>` and :ref:`community<extensions-community>`
contributions.


.. _extensions-official:

Officially Supported Extensions
-------------------------------


The following extensions are officially supported and were developed as part
of the core project:


Model extensions
~~~~~~~~~~~~~~~~

* Feature Extraction
    - `ASReview-vocab-extractor <https://github.com/asreview/asreview-extension-vocab-extractor>`__: 
      This extension adds two feature extractors that extract vocabulary and 
      vector matrices during simulation phases. Might one day be integrated to the 
      core.

Subcommand extensions
~~~~~~~~~~~~~~~~~~~~~

* Visualization
    - :doc:`extension_visualization`: Plotting functionality for state files 
      produced by ASReview.

* Wordcloud
    - :doc:`extension_wordcloud`: Creates a visual impression of the contents of 
      datasets via a wordcloud.

* Statistics
    - `ASReview-statistics <https://github.com/asreview/asreview-statistics>`__: 
      Tool to give some basic properties of a dataset, such as number of papers, 
      number of inclusions.


* Hyperparameter Optimization 
    - `ASReview-hyperopt <https://github.com/asreview/asreview-hyperopt>`__:
      Optimize the hyperparameters of the models in ASReview.


Dataset extensions 
~~~~~~~~~~~~~~~~~~

* COVID-19
    - :doc:`extension_covid19`: Makes the literature on COVID-19 directly
      available in ASReviews so reviewers can start reviewing the latest
      scientific literature on COVID-19 as soon as possible.



.. _extensions-community:

Community-Maintained Extensions
-------------------------------

ASReview has support for community-maintained extensions, that enable you to
seamlessly integrate your code with the ASReview framework. These extensions can
extend the software with new models, subcommands, and datasets.

The following extensions are developed and maintained by the ASReview community:


* ASReview CNN classifier 
    - This ASReview extension adds a convolutional neural network (CNN) model 
      for use during the simulation phase.
    - `Github <https://github.com/JTeijema/asreview-plugin-model-cnn-17-layer>`__

* ASReview Model Switcher 
    - This extension adds a model that switches between two models during 
      runtime. It can be useful for when later stages of data classification 
      require different models.
    - `Github <https://github.com/JTeijema/asreview-plugin-model-switcher>`__

* ASReview NB + CNN classifier with HPO
    - This extension adds a model consisting out of two separate classifiers 
      for use during simulation mode. The first *X* amount of iterations 
      (default = 500) are run with a Naïve Bayes model. After the switching,
      a switch to a CNN is made. Immediately at this switching point, and 
      then after each 150 iterations, hyperparameter optimization is conducted 
      to find the most suitable CNN architecture for current iteration.
    - `Github <https://github.com/BartJanBoverhof/asreview-cnn-hpo>`__ 

* ASReview matrix and vocabulary extractor for TF-IDF and Doc2Vec
    - An extension for ASReview that adds a tf-idf extractor that saves the
      matrix and the vocabulary to pickle and JSON respectively, and a doc2vec
      extractor that grabs the entire doc2vec model. 
    - `Github <https://github.com/asreview/asreview-extension-vocab-extractor>`__ 

If an extension is not on this list, or you made one and you would like it to 
be added to this list, please initiate an issue on `Github
<https://github.com/asreview/asreview/issues/new/choose>`__.


Installation
------------

If an extension is uploaded to PyPI, it can be installed via command line. In
this example, the `asreview-visualization
<https://github.com/asreview/ASReview-visualization>`__ extension is used. The
extension extends ASReview with functionality for creating plots from the
ASReview file.

Install the extension with:

.. code:: bash

    pip install asreview-visualization

If the extension is published on Github, installing directly from the repo can
be done with:

.. code:: bash

    pip install git@github.com:{USER_NAME}/{REPO_NAME}.github

See :ref:`develop-extensions` for information about developing your own
extension. 


