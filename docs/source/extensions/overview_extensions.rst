Overview
========

ASReview has support for extensions, which are a nice way to extend the
functionality of the :doc:`ASReview LAB <../lab/overview_lab>` software or the
:doc:`command line interface <../API/cli>`. There are :ref:`officially
supported extensions<extensions-official>` and :ref:`community'<extensions-community>`
contributions. There is extensive documentation on how to add new :ref:`models
<extensions-dev-model>` (i.e., classifiers, query strategies, balance
strategies, or feature extraction techniques) or completely new
:ref:`subcommands <extensions-dev-subcommand>`.


.. _extensions-official:

Offically Supported Extensions
------------------------------


The following extensions are officially supported and were developed as part
of the core project:

- :doc:`extension_covid19`: Make literature on COVID-19 available in ASReview.
- :doc:`extension_visualization`: Plotting functionality for state files produced by ASReview.
- :doc:`extension_wordcloud`: Create a visual impression of the contents of datasets via a wordcloud.
- ``asreview-statistics``: Tool to give some basic properties of a dataset, such as number of
  papers, number of inclusions. `GitHub <https://github.com/asreview/asreview-statistics>`__
- ``asreview-hyperopt``: Optimize the hyperparameters of the models in ASReview. `GitHub <https://github.com/asreview/asreview-hyperopt>`__



.. _extensions-community:

Community-maintained extensions
-----------------------------

The following extensions are developed and maintained by the ASReview community:

Work in Progress


If an extension is not on this list, or you made one and you would like it to be added to this
list, please initiate an issue on `Github
<https://github.com/asreview/asreview/issues>`__.
