************************************************
ASReview: Active learning for Systematic Reviews
************************************************

ASReview is a project to accelerate the process of systematic reviewing.
It is written in Python, and uses deep learning to predict which papers should be
most likely included in the review. Our software is designed to accelerate the step
of screening abstracts and titles with a minimum of papers to be read by a
human with no or very few false negatives.

ASReview software consists of a user friendly front-end (ASReview LAB) and a
powerful command line interface. The command line interface is to measure the
performance of the active learning models on the results of fully labeled
systematic reviews.

The source code is freely available at
`GitHub <https://github.com/asreview/asreview>`_.

.. toctree::
   :maxdepth: 1

   installation

   activelearning

   simulation_study_results

   covid-19

.. toctree::
   :maxdepth: 2
   :caption: ASReview LAB

   quicktour

   datasets

   features

   user_testing_algorithms

   faq

   troubleshooting

.. toctree::
   :maxdepth: 2
   :caption: API

   cli

   extensions_dev

   reference

.. toctree::
   :maxdepth: 2
   :caption: Guides

   sim_overview

   api

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`



Citation
========

The preprint `ArXiv:2006.12166`_ can be used to cite this project.

::

   van de Schoot, Rens, et al. “ASReview: Open Source Software for Efficient and
   Transparent Active Learning for Systematic Reviews.” ArXiv:2006.12166 [Cs],
   June 2020. arXiv.org, http://arxiv.org/abs/2006.12166.

For citing the software, please refer to the specific release of the
ASReview software on Zenodo |DOI|. The menu on the right can be used to
find the citation format of prevalence.

.. _`ArXiv:2006.12166`: http://arxiv.org/abs/2006.12166

.. |DOI| image:: https://zenodo.org/badge/DOI/10.5281/zenodo.3345592.svg
   :target: https://doi.org/10.5281/zenodo.3345592



