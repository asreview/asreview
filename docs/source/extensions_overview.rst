Extensions
==========

ASReview has extensive support for extensions. They can extend the
functionality of ASReview LAB, and the
:doc:`Command Line Interface <cli>`. There are :ref:`officially
supported extensions <extensions-official>` and `community maintained extensions <https://github.com/asreview/asreview/discussions/1140>`_.

Looking to develop your own extension? See :ref:`develop-extensions` for
detailed instructions.


Installation
------------

Most extensions are installable from PyPI (the same way ASReview LAB is
installed) or GitHub. It is preferred to follow the installation instructions
provided by the extension.

The following example shows the installation of `ASReview Insights
<https://github.com/asreview/ASReview-insights>`__, an extension for plotting
and computing metrics for simulations in ASReview.

.. code:: bash

    pip install asreview-insights

Extension (only) published on Github can be installed directly from the
repository. Replace `{USER_NAME}` and `{REPO_NAME}` by the corresponding
values of the extension.

.. code:: bash

    pip install git@github.com:{USER_NAME}/{REPO_NAME}.git


.. _extensions-official:

Supported Extensions
--------------------

The following extensions are officially supported and maintained by the
maintainers of ASReview LAB. They are extensively tested and integrate well
with ASReview LAB.

* ASReview Datatools
    - `ASReview-datatools <https://github.com/asreview/asreview-datatools>`__:
      Tool for describing, cleaning (input) data, and converting file formats via the command line.

* ASReview Insights
    - `ASReview-insights <https://github.com/asreview/asreview-insights>`__:
      Advanced insights to ASReview simulations like performance plots and metrics.

* ASReview Wordcloud
    - `ASReview-wordcloud <https://github.com/asreview/asreview-wordcloud>`__: Create wordclouds to visualize the contents of datasets.

* ASReview Makita
    - `ASReview-makita <https://github.com/asreview/asreview-makita>`__: ASReviews' Makita (MAKe IT Automatic) is a workflow generator for simulation studies using the command line interface of ASReview LAB. Makita can be used to simplify your own research by enabling you to effortlessly generate the framework and code for your simulation study.


.. _extensions-community:

List of extensions for ASReview LAB
-----------------------------------

The `List of extensions for ASReview LAB <https://github.com/asreview/asreview/discussions/1140>`__ on the Discussion platform
gives an overview of known extensions to ASReview LAB and other useful tools
in the AI-aided systematic review pipeline. These extensions can extend the
software with new models, subcommands, and datasets.
