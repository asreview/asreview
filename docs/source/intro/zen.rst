The Zen of Elas
---------------

Research Team
~~~~~~~~~~~~~

ASReview is a research project coordinated by `Rens van de Schoot <www.rensvandeschoot.com>`_, full Professor at
the Department of Methodology & Statistics at Utrecht University, The
Netherlands. Also, top researcher and machine learning expert Daniel Oberski
is part of our team, as well as Lars Tummers, Professor of Public Management
and Behavior at Utrecht University. He has extensive experience with
conducting systematic reviews in the social and behavioral sciences.

Our maintainers are Jonathan de Bruin (Lead engineer) and Raoul Schram
together with many of their colleagues including Parisa Zahedi who programmed
the very first simulation study. We are supported by systematic review
specialists at the Utrecht University Library (Bianca Kramer, Jan de Boer,
Felix Weijdema). The Art-Work was developed by `Joukje Willemsen <http://www.statistics-illustrated.com/>`_.

Moreover, many others helped the project: Many thanks to all the
`contributors <https://github.com/asreview/asreview/blob/master/CONTRIBUTORS.md>`_!


Principles of Elas
~~~~~~~~~~~~~~~~~~

Elas is the mascotte of ASReview and your `Electronic Learning Assistant
<https://asreview.nl/the-story-behind-elas/>`_ who will guide you through the
interactive process  of making decisions using Artificial Intelligence in
ASReview. Elas comes with some important principles:


**Humans are the Oracle**
It’s the interaction between humans and machines
which will take science a major leap forward.  We believe a human should make
the final decision about whether to mark a record as  relevant/irrelevant
(hence, is the Oracle) and the software merely orders the records on  the
relevance score as predicted by the model in each iteration of the active
learning cycle.


**Open & Transparent**
We are strong opponents of `open science <https://asreview.nl/open-science/>`_ and therefore
all *our* code is stored  in the cloud but *your* data
isn’t. We value your privacy  and hence do not get to see any of your data
(everyhing happens on your laptop).  We do hope you believe like us in the
`FAIR data principles <https://www.go-fair.org/fair-principles/>`_ and publish your data,
results and the technical logfiles on a data repository.


**Unbiasedness**
We signed the `DORA-declaration <https://sfdora.org/>`_  and we
only present text for unbiased  decision making. So, when screening for
example academic papers we only show titles and abstracts,  and we do not
present authors, or journal names. This way, you can focus on what is truly
important  (the content) and don’t get tempted to use irrelevant information.


**AI-aided Interface**  Simplicity is the ultimate sophistication (Davinci)
and therefore we keep the front-end as  clean as possible. Boring, but
efficient because the :doc:`magic <../guides/activelearning>` happens under
the hood.


**Garbage in garbage out**
We focus on the machine learning part of the pipeline and not on the pre- or
post processing  of the data (which reference managers are designed for). Be
aware of the principle GIGO and  don’t blame Elas if the performance is not as
good as expected (`and first check the quality of your data <https://asreview.nl/the-importance-of-abstracts/>`_).


The Case of Systematic Reviewing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ASReview is a generic tool for the screening  of :doc:`any type of
text <datasets>`, but often use the case of systematic reviewing is ued to
illustrate its usefulness, see also the blog post `ASReview Class 101 <https://asreview.nl/asreview-class-101/>`_.

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

The goal of ASReview is to help scholars and practitioners to get an overview
of the most relevant records for their work as efficiently as possible, while
being transparent in the process. It is uses active learning, allows multiple
ML-models,  and ships with a benchmark mode which is especially useful for
comparing and designing algorithms.  Furthermore, it is intended to be easily
extensible, allowing third parties to add modules  that enhance the pipeline
and can process any text (although we consider systematic reviewing as a very
useful approach).

[INSERT IMAGE WORKFLOW]
