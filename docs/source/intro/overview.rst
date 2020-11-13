Overview
========

With the emergence of online publishing, the number of scientific papers on 
any topic, e.g. COVID19, is skyrocketing. Simultaneously, the public press 
and social media also produce data by the second. All this textual data 
presents opportunities to scholars, but it also confronts them with new 
challenges. To summarize all this data, researchers write systematic reviews, 
providing essential, comprehensive overviews of relevant topics. 
To achieve this, they have to screen (tens of) thousands of studies by hand 
for inclusion in their overview. As truly relevant papers are very sparse (i.e., often <10%), 
this is an extremely imbalanced data problem. The process of finding these 
rare relevant papers is error prone and very time intensive. 

The rapidly evolving field of machine learning (ML) has allowed the development 
of ML-aided pipelines that assist in finding relevant texts for such search tasks. 
A well-established approach to increase the efficiency of title and abstract 
screening is determining prioritization with active learning [LINK NAAR GUiDES - INTRO ACTIVE LEARNING], 
which is very effective for systematic reviewing[REF NAAR GUIDES - SIMULATIONS].  

We present an open source ML-aided pipeline with active learning for systematic reviews: ASReview. 
The goal of ASReview is to help scholars and practitioners to get an overview 
of the most relevant records for their work as efficiently as possible,
while being transparent in the process. It is uses active learning, allows multiple ML-models, 
and ships with a benchmark mode which is especially useful for comparing and designing algorithms. 
Furthermore, it is intended to be easily extensible, allowing third parties to add modules 
that enhance the pipeline and can process any text (although we consider systematic reviewing as a very useful approach).

The source code of ASReview is available open source under an Apache-2.0 license on `GitHub <https://github.com/asreview/asreview>`_. 
Compiled and packaged versions of the software are available on the Python Package Index [https://pypi.org/project/asreview] or Docker Hub [https://hub.docker.com/r/asreview/asreview]. The software ASReview implements an ‘oracle’, a ‘simulation’ and an ‘exploration’ mode. 
The oracle mode is used to perform a systematic review with interaction by the user. 
The simulation mode is used for simulation of the ASReview performance on existing systematic reviews. 
The exploration mode can be used for teaching purposes and includes several pre-loaded labelled datasets. 


Citation
--------

The preprint `ArXiv:2006.12166`_ can be used to cite this project.

::

   van de Schoot, Rens, et al. “ASReview: Open Source Software for Efficient and
   Transparent Active Learning for Systematic Reviews.” ArXiv:2006.12166 [Cs],
   June 2020. arXiv.org, http://arxiv.org/abs/2006.12166.

For citing the software, please refer to the specific release of the
ASReview software on Zenodo |DOI|. The menu on the right (in Zenodo) can be used to
find the citation format of prevalence.

.. _`ArXiv:2006.12166`: http://arxiv.org/abs/2006.12166

.. |DOI| image:: https://zenodo.org/badge/DOI/10.5281/zenodo.3345592.svg
   :target: https://doi.org/10.5281/zenodo.3345592



