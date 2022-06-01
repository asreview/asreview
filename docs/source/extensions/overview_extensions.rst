Extensions
==========

ASReview has extensive support for extensions. They can extend the
functionality of :doc:`ASReview LAB <../lab/overview_lab>` and the
:doc:`Command Line Interface <../API/cli>`. There are :ref:`officially
supported extensions<extensions-official>` and
:ref:`community<extensions-community>` maintained extensions.


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


.. _extensions-official:

Officially Supported Extensions
-------------------------------

The following extensions are officially supported and maintained. They are developed as part of the core project:

* ASReview Datatools
    - `ASReview-datatools <https://github.com/asreview/asreview-datatools>`__:
      Tool for describing, cleaning (input) data, and converting file formats via the command line.

* ASReview Insights
    - `ASReview-insights <https://github.com/asreview/asreview-insights>`__:
      Advanced insights to ASReview simulations like performance plots and metrics.

* ASReview Wordcloud
    - :doc:`extension_wordcloud`: Create wordclouds to visualize the contents of datasets.



.. _extensions-community:

List of extensions for ASReview LAB
-----------------------------------

ASReview has extensive support for (community-maintained) extensions. These
extensions can extend the software with new models, subcommands, and datasets.



