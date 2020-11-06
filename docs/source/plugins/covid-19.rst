.. figure:: https://raw.githubusercontent.com/asreview/asreview/master/images/intro-covid19-small.png
   :alt: ASReview against COVID19


ASReview against COVID-19
=========================

For many questions from medical doctors, journalists, policy makers the scientific literature on COVID-19 needs to be checked in a systematic way to avoid biased decision-making. For example, to develop evidence-based medical guidelines to transparently support medical doctors. Medical guidelines rely on comprehensive systematic reviews. Such reviews entail several explicit and reproducible steps, including identifying all likely relevant papers in a standardized way, extracting data from eligible studies, and synthesizing the results into medical guidelines. They need to scan hundreds, or even thousands of COVID-19 related studies, by hand to find relevant papers to include in their overview. This is error prone and extremely time intensive; time we do not have right now! 

The software relies on Active learning [REF NAAR GUIDE] which denotes the scenario in which the reviewer is labeling data that are presented by a machine learning model. The machine learns from the reviewers’ decisions and uses this knowledge in selecting the reference that will be presented to the reviewer next. In this way, the COVID-19 related papers are presented ordered from most to least relevant based on the input from the user. The goal of the software is to help scholars and practitioners to get an overview of the most relevant papers for their work as efficiently as possible, while being transparent in the process.



ASReview plugin
---------------

To help combat the COVID-19 crisis, the ASReview team has decided to
release [REF NAAR FORTUNE PAPER - https://asreview.nl/interview-in-fortune/] a plugin that provides three datasets on
COVID-19. These are integrated automatically into ASReview once we
install the correct packages, so reviewers can start reviewing the
latest scientific literature on COVID-19 as soon as possible! 

CORD-19 dataset
---------------

Two versions of the CORD-19 dataset (publications relating to COVID-19) are
made available in ASReview:

-  full CORD-19 dataset [REF NAAR https://arxiv.org/abs/2004.10706]
-  custum made subset of the CORD-19 dataset with publications from December 2019 onwards

The Cord19 database, developed by the Allen Institute for AI [REF https://www.semanticscholar.org/cord19 ], with all publications on COVID-19 and other coronavirus research (e.g. SARS, MERS, etc.) from PubMed Central, the WHO COVID-19 database of publications, the preprint servers bioRxiv and medRxiv and papers contributed by specific publishers. 

In addition to the full dataset, we construct automatically a daily subset of the database with studies published after December 1st, 2019 to search for relevant papers published during the COVID-19 crisis. 

The datasets are updated in ASReview plugin shortly after the release by
the Allen Institute for AI.

Pre-print dataset
-----------------

A separate dataset of COVID-19 related preprints [REF NAAR https://github.com/nicholasmfraser/covid19_preprints], containing metadata of preprints from over 15 preprints servers across disciplines, published since January 1, 2020. The preprint dataset is updated weekly by the maintainers (Nicholas Fraser and Bianca Kramer) and then automatically updated in ASReview as well. As this dataset is not readily available to researchers through regular search engines (e.g. PubMed), its inclusion in ASReview provided added value to researchers interested in COVID-19 research, especially if they want a quick way to screen preprints specifically. 


Installation and usage
----------------------

The COVID-19 plug-in requires ASReview 0.8 or higher. Install ASReview
by following the instructions in :doc:`../installation`.

Install the extension with pip:

.. code:: bash

    pip install asreview-covid19

The datasets are immediately available after starting ASReview.

.. code:: bash

    asreview lab

The datasets are selectable in Step 2 of the project initialization. For
more information on the usage of ASReview, please have a look at the
:doc:`../quicktour`.

|ASReview CORD19 datasets|

License
-------

The ASReview software and the plugin have an Apache 2.0 LICENSE. For the
datasets, please see the license of the CORD-19 dataset
https://www.semanticscholar.org/cord19.


.. |ASReview CORD19 datasets| image:: https://raw.githubusercontent.com/asreview/asreview/master/images/asreview-covid19-screenshot.png
   :target: https://github.com/asreview/asreview-covid19
