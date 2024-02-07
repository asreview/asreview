Products
========

The following products are available:

ASReview LAB
------------
ASReview LAB is an open-source and free-to-use software product resulting from
an academic collaboration. It enables AI-aided systematic screening of
textual data, such as in systematic reviews or meta-analyses. It runs in a
web-browser and is flexible in using many different feature extractors and
classifiers. For more information about the underlying infrastructure, refer
to the `Nature Machine Intelligence publication
<https://www.nature.com/articles/s42256-020-00287-7>`__.

ASReview LAB Server
-------------------
`ASReview LAB Server`_ expands upon the capabilities of ASReview LAB by
offering additional features like authentication and collaborative model
refinement. It is a self-hosted solution that ensures privacy and is suited
for teams requiring secure access and collaboration.

Datasets
--------
ASReview also provides access to a synergistic collection of datasets, which
can be utilized for various research purposes. Explore the Synergy dataset at
our `GitHub datasets repository
<https://github.com/asreview/synergy-dataset>`__.

Extensions
----------

ASReview supports for extending the software with new
models, subcommands, and datasets. They can extend the
functionality of ASReview LAB, and the
:doc:`Command Line Interface <../technical/cli>`. There are :ref:`officially
supported extensions <extensions-official>` and `community maintained extensions <https://github.com/asreview/asreview/discussions/1140>`_.

Looking to develop your own extension? See :doc:`../technical/extensions_dev` for
detailed instructions.

Installation
~~~~~~~~~~~~

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
~~~~~~~~~~~~~~~~~~~~

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

Community maintained extensions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The `List of extensions for ASReview LAB <https://github.com/asreview/asreview/discussions/1140>`__ on the Discussion platform
gives an overview of known extensions to ASReview LAB and other useful tools
in the AI-aided systematic review pipeline.
