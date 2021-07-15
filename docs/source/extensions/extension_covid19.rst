.. figure:: https://raw.githubusercontent.com/asreview/asreview/master/images/intro-covid19-small.png
   :alt: ASReview against COVID19


ASReview against COVID-19
=========================

For many questions from medical doctors, journalists, policy makers the
scientific literature on COVID-19 needs to be checked in a systematic way to
avoid biased decision-making. For example, to develop evidence-based medical
guidelines to transparently support medical doctors. Medical guidelines rely
on comprehensive systematic reviews. Such reviews entail several explicit and
reproducible steps, including identifying all likely relevant papers in a
standardized way, extracting data from eligible studies, and synthesizing the
results into medical guidelines. One might need to manually scan hundreds, or even thousands
of COVID-19 related studies. This process is error prone and extremely time consuming; time we do
not have right now!

The software relies on :doc:`Active learning <../guides/activelearning>` which denotes the
scenario in which the reviewer is labeling data that are presented by a
machine learning model. The machine learns from the reviewers’ decisions and
uses this knowledge in selecting the reference that will be presented to the
reviewer next. In this way, the COVID-19 related papers are presented in an orderly manner,
that is from most to least relevant based on the input from the user. The goal of the
software is to help scholars and practitioners to get an overview of the most
relevant papers for their work as efficiently as possible, while being
transparent in the process.



ASReview Extension
------------------

To help combat the COVID-19 crisis, the ASReview team developed an extension that
provides three datasets on COVID-19. These are automatically available in
ASReview after installing the extension, so reviewers can start
reviewing the latest scientific literature on COVID-19 as soon as possible!

CORD-19 dataset
---------------

Two versions of the CORD-19 dataset (publications relating to COVID-19) are
made available in ASReview:

-  Full `CORD-19 dataset <https://arxiv.org/abs/2004.10706>`_ .
-  Custum made subset of the CORD-19 dataset with publications from December 2019 onwards.

The Cord19 database, developed by the `Allen Institute for AI
<https://www.semanticscholar.org/cord19>`_, with all publications on COVID-19
and other coronavirus research (e.g. SARS, MERS, etc.) from PubMed Central,
the WHO COVID-19 database of publications, the preprint servers bioRxiv and
medRxiv and papers contributed by specific publishers.

In addition to the full dataset, there is a subset available of studies
published after December 1st, 2019 to search for relevant papers published
during the COVID-19 crisis.

The datasets are updated in ASReview extension shortly after a release by
the Allen Institute for AI.

Pre-print dataset
-----------------

A separate dataset of COVID-19 related `preprints
<https://github.com/nicholasmfraser/covid19_preprints>`_, containing metadata
of preprints from over 15 preprints servers across disciplines, published
since January 1, 2020. The preprint dataset is updated weekly by the
maintainers (Nicholas Fraser and Bianca Kramer) and then automatically updated
in ASReview as well. As this dataset is not readily available to researchers
through regular search engines (e.g. PubMed), its inclusion in ASReview
provides added value to researchers interested in COVID-19 research,
especially if they want a quick way to screen preprints specifically.


Installation and usage
----------------------

The COVID-19 extension requires ASReview 0.8 or higher. Install ASReview
by following the instructions in :doc:`../intro/installation`.

Install the extension with pip:

.. code:: bash

    pip install asreview-covid19

The datasets are immediately available after starting ASReview.

.. code:: bash

    asreview lab

The datasets are selectable in Step 2 of the project initialization. For
more information on the usage of ASReview, have a look at the
:doc:`../lab/oracle`.

|ASReview CORD19 datasets|

License
-------

The ASReview software and the extensions have an Apache 2.0 LICENSE. For the
datasets, see the license of the CORD-19 dataset
https://www.semanticscholar.org/cord19.


.. |ASReview CORD19 datasets| image:: https://raw.githubusercontent.com/asreview/asreview/master/images/asreview-covid19-screenshot.png
   :target: https://github.com/asreview/asreview-covid19
