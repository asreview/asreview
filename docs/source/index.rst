ASReview LAB: Active learning for Systematic Reviews
====================================================

.. figure:: ../../images/ASReviewLAB_explanation_Website_v3_wit.png
    :alt: ASReview LAB overview

Welcome to the ASReview LAB Documentation!

ASReview LAB is a user-friendly software for exploring the future of AI in systematic
reviews. Three modes are implemented as follows:

- In :doc:`../lab/oracle`, you can review your dataset with interactive artificial
  intelligence (AI).
- In :doc:`../lab/exploration`, you can explore or demonstrate ASReview LAB with a
  completely labeled dataset. This mode is suitable for teaching purposes.
- In :doc:`../lab/simulation`, you can simulate a review on a completely labeled dataset
  to see the performance of ASReview LAB.

This documentation contains a complete guide to using ASReview LAB. If you need more
help, please find answers or ask experts in the ASReview community on `GitHub
Discussions <https://github.com/asreview/asreview/discussions>`__. If you want to report
a bug or request a feature, please submit an issue on `GitHub
<https://github.com/asreview/asreview/issues/new/choose>`__.

You can find a citable PDF of this documentation on `Zenodo
<https://doi.org/10.5281/zenodo.4287119>`_.

The source code of ASReview LAB is licensed under the `Apache 2.0 License
<https://github.com/asreview/asreview/blob/master/LICENSE>`__. Compiled and packaged
versions are available on `Python Package Index <https://pypi.org/project/asreview>`_
and `Docker Hub <https://hub.docker.com/r/asreview/asreview>`_.

.. toctree::
    :caption: Install
    :maxdepth: 1

    install/install

    pip <install/pip>

    install/docker

    install/ts

.. toctree::
    :caption: Introduction
    :maxdepth: 1

    intro/about

    intro/vocabulary

    intro/contribute

    intro/cite

.. toctree::
    :maxdepth: 1
    :caption: Getting Started

    lab/launch

    lab/oracle

    lab/exploration

    lab/simulation

    intro/datasets

    features/settings

    features/pre_screening

    features/screening

    features/post_screening

.. toctree::
    :maxdepth: 1
    :caption: Guides

    guides/simulation_study_results

    guides/sim_overview

    guides/api

.. toctree::
    :maxdepth: 1
    :caption: Extensions

    extensions/overview_extensions

.. toctree::
    :maxdepth: 1
    :caption: Development

    API/overview_development

    API/cli

    API/extensions_dev

    API/asreview_file

    API/reference

    API/extension_dev

Indices and tables
------------------

- :ref:`genindex`
- :ref:`modindex`
