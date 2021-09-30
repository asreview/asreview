Overview
========

ASReview has support for extensions, which are a nice way to extend the
functionality of the :doc:`ASReview LAB <../lab/overview_lab>` software or the
:doc:`command line interface <../API/cli>`. There are :ref:`officially
supported extensions<extensions-official>` and :ref:`community<extensions-community>`
contributions.


.. _extensions-official:

Offically Supported Extensions
------------------------------


The following extensions are officially supported and were developed as part
of the core project:

- :doc:`extension_covid19`: Make literature on COVID-19 available in ASReview.
- :doc:`extension_visualization`: Plotting functionality for state files 
  produced by ASReview.
- :doc:`extension_wordcloud`: Create a visual impression of the contents of 
  datasets via a wordcloud.
- `ASReview-statistics <https://github.com/asreview/asreview-statistics>`__: 
  Tool to give some basic properties of a dataset, such as number of papers, 
  number of inclusions. 
- `ASReview-vocab-extractor <https://github.com/asreview/asreview-extension-vocab-extractor>`__: 
  This extension adds two feature extractors that extract vocabulary and 
  vector matrices during simulation phases. Might one day be integrated to the 
  core.
- `ASReview-hyperopt <https://github.com/asreview/asreview-hyperopt>`__: 
  Optimize the hyperparameters of the models in ASReview.



.. _extensions-community:

Community-maintained extensions
-------------------------------

ASReview has support for community-maintained extensions, that enable you to 
seemlessly integrate your code with the ASReview framework. These extensions 
can extend the software with new subcommands, models, and datasets.

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
    - This extension adds a model consisting out of two seperate classifiers 
      for use during simulation mode. The first *X* amount of iterations 
      (default = 500) are run with a Naïve Bayes model. After the switchpoint,
      a switch to a CNN is made. Immediately at this switching point, and 
      then after each 150 iterations, hyperparameter optimisation is conducted 
      to find the most suitable CNN architecture for current iteration.
    - `Github <https://github.com/BartJanBoverhof/asreview-cnn-hpo>`__ 


If an extension is not on this list, or you made one and you would like it to 
be added to this list, please initiate an issue on `Github
<https://github.com/asreview/asreview/issues>`__.


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


