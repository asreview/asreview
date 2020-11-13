Introduction
------------

With the emergence of online publishing, the number of scientific papers on 
any topic, e.g. COVID19, is skyrocketing. Simultaneously, the public press 
and social media also produce data by the second. All this textual data 
presents opportunities to scholars, but it also confronts them with new 
challenges. To summarize all this data, researchers write systematic reviews, 
providing essential, comprehensive overviews of relevant topics.  To achieve
this, they have to screen (tens of) thousands of studies by hand  for
inclusion in their overview. As truly relevant papers are very sparse (i.e.,
often <10%),  this is an extremely imbalanced data problem. The process of
finding these  rare relevant papers is error prone and very time intensive. 

The rapidly evolving field of machine learning (ML) has allowed the
development  of ML-aided pipelines that assist in finding relevant texts for
such search tasks.  A well-established approach to increase the efficiency of
title and abstract  screening is determining prioritization with :doc:`active
learning<../guides/activelearning>`,  which is very effective
for :doc:`systematic reviewing<../guides/simulation_study_results>`.  
We present an open source ML-aided pipeline with active learning for
systematic reviews: ASReview.  The goal of ASReview is to help scholars and
practitioners to get an overview  of the most relevant records for their work
as efficiently as possible, while being transparent in the process. It is uses
active learning, allows multiple ML-models,  and ships with a benchmark mode
which is especially useful for comparing and designing algorithms. 
Furthermore, it is intended to be easily extensible, allowing third parties to
add modules  that enhance the pipeline and can process any text (although we
consider systematic reviewing as a very useful approach).

The source code of ASReview is available open source under an Apache-2.0
license on `GitHub <https://github.com/asreview/asreview>`_.  Compiled and
packaged versions of the software are available on the  `Python Package Index
<https://pypi.org/project/asreview>`_ or `Docker Hub
<https://hub.docker.com/r/asreview/asreview>`_. The software ASReview
implements an :doc:`oracle<../lab/oracle>`,
:doc:`exploration<../lab/exploration>` and a
:doc:`simulation<../lab/simulation>` mode.  The oracle mode is used to perform
a systematic review with interaction by the user.  The simulation mode is used
for simulation of the ASReview performance on existing systematic reviews. 
The exploration mode can be used for teaching purposes and includes several
pre-loaded labelled datasets. 










