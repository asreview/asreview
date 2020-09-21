Frequently Asked Questions
==========================


General questions
-----------------

Why only serve most relevant documents and not also occasionally a random record?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Screening only the most relevant documents can save the most time. One
problem that we did encounter when developing the tool was that it could
“funnel” your results to one specific aspect or view point, discarding
other records. Having occasional random records might help you stay
clear of this funnel, for example 5% random and 95% maximum sampling. .
Moreover,you get five random records upfront, to initially train the
tool. The simulation mode can tell us if the performance is actually
improved by also serving random records.

How to deal with records that do not have abstracts?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Some records simply do not have abstracts. In case of missingness,
we advise you to (quickly) screen unseen records with missing abstracts
manually once you have finished screening with ASReview. However, it is
very important for the performance of ASReview to have as little missing
data as possible. We have written `a
blogpost <https://asreview.nl/the-importance-of-abstracts/>`__ on how
the absence of abstracts impacts your review and how you can retrieve
missing abstracts.

How does the tool handle quality and standardisation of abstracts? Is this accounted for in any way in training the machine learning model?
~~~~~~~~~

| Source: UBU colleagues
| The texts of the documents are handled as is, there is no attempt to
  differentiate between e.g. different parts of abstracts. This could be
  done with standardized abstracts - but not all abstracts are
  standardized.

Also see `How to deal with articles that do not have abstracts? <faq.html#how-to-deal-with-records-that-do-not-have-abstracts>`__

What happens if I have records from different languages?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The texts of the records are handled as is. ASReview does not
differentiate between records that use different languages. Therefore,
ASReview will have difficulty with identifying a relevant record when it
is written in a language that is different from the rest of the records
in your dataset.

Can the tool be used in combination with any (academic) database?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes it can. You will have to export data from a database yourself, and
import these into ASReview. For supported databases and formats, please
read the `documentation on creating datasets <datasets.html>`__.

Why did you choose a license that allows commercial reuse for the software?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

| We believe that free and open source software is important in
  advancing research. In the field of machine learning and systematic
  reviews, transparency is very important to give a better understanding
  of the process.
| [Also explain ASR Lab as a research project, that we do not have the
  ambition to build fancy tools and invite others (including commercial
  companies) to bring this further]

What do you mean with a dataset?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

With a dataset we mean a file that contains information such as the
title, abstract, authors, doi etc. of all articles that are or have been
screened.

What do you mean with a model?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A model (sometimes also referred to as a classifier) is a machine
learning model that is used to predict the relevance of the records.

Quality of ASReview
-------------------

Has the use of ASReview in systematic reviews been validated?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

| We have shown `here <https://arxiv.org/abs/2006.12166>`__ and
  `here <https://osf.io/w3kbq/>`__ that by using active learning,
  ASReview can lead to far more efficient reviewing than manual
  reviewing, while exhibiting adequate quality. Also ASReview can be
  used in combination with traditional approaches to systematic
  reviewing. [*Blog post needed*].

Also see:

-  `Has ASReview been cited by any peer-reviewed article? <faq.html#has-asreview-been-used-in-any-peer-reviewed-article>`__
-  `How can I refer to ASReview in my paper? <faq.html#how-can-i-refer-to-asreview-in-my-paper>`__

Has ASReview been used in any peer-reviewed article?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Multiple researchers have started using ASReview. At the moment, no
systematic reviews have been published using the tool, but several are
on its way. Our team has been working on a paper that is currently under
peer review.

Also see:

-  `Has the use of ASReview in systematic reviews been validated? <faq.html#how-can-i-refer-to-asreview-in-my-paper>`__
-  `How can I refer to ASReview in my paper? <faq.html#how-can-i-refer-to-asreview-in-my-paper>`__

How can I refer to ASReview in my paper?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you want to refer to ASReview in your paper, please cite our
pre-print on *ArXiv*. Also, if you want to refer to the software
directly you can cite our software publication on *Zenodo*.

How do we decide when to stop?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

| At this moment we do not provide any guidance on this; the decision of
  when to stop is left to the user. An example of a stopping rule is
  when you encounter 50-100 irrelevant records in a row.

How to use ASReview LAB in a systematic review
----------------------------------------------

Can we use ASReview LAB for things other than Systematic Reviews?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ASReview LAB was originally designed for screening records with a
title and an abstract. However, we try to develop a tool that is not
exclusively fit for screening titles and abstracts in systematic
reviews. In fact, ASReview LAB is intended to be applicable to all cases
where a small number of relevant “textual items” have to be selected
from an enormous pile of texts, such as patents, jurisdiction,
historical newspapers, company reports, or keeping track of relevant
research in an information overload environment.

.. See also:

.. -  Can we use ASReview LAB also to screen based on full text?
.. ~~~~~~~~~

Can we use ASReview LAB with multiple screeners?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Currently, we do not support collaboration of multiple users within one
project. We recommend multiple users to screen their records
independently in separate projects. Afterwards, the results can be
easily exported and combined to compare their screening decisions.

Can we use ASReview LAB also to screen based on full text?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ASReview LAB was originally designed for screening records with a
title and an abstract. Viewing the full text can be accomplished by
including a link to the original source of the publication by adding a
Digital Object Identifier (DOI) to your dataset (column with name ‘doi’
in tabular data), which will be shown during screening. Note that the
full text will not be used to train the model. Alternatively, you are
free to put the full text into the abstract field of your dataset. When
you put full-text in the abstract field, the full-text is used for
display and training purposes.

Also see: `Can we use ASReview LAB for things other than Systematic Reviews? <faq.html#can-we-use-asreview-lab-for-things-other-than-systematic-reviews>`__

Can we use ASReview LAB as a stand-alone screener? (e.g. put in the prior information and let ELAS select the relevant records automatically)
~~~~~~~~~

No. We believe that machine learning algorithms should never replace
human reviewers in deciding which records are relevant. Classification
techniques are simply not good enough for this purpose. In systematic
reviews, all relevant publications should be seen by the researcher. We
refer to this as Researcher-in-the-loop as described in our paper
introducing ASReview [link to preprint?].

What parts of my Systematic Review project does ASReview support?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ASReview LAB is designed to optimize the Screening phase of your
systematic review, e.g. screening titles and abstracts of a large number
of publications. For the Identification phase, we recommend you to use
your current databases and reference managers,or to distribute the work
among your colleagues. You can import your records into ASReview, screen
them, and import the results back into your own tools.

Technical questions
-------------------


Is it possible to get the inclusion likelihood for unlabelled papers?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Unfortunately, no. Getting unbiased estimates for inclusion probabilities is a
hard problem, especially in combination with active learning. Internally, we
have scores that signify which papers are more likely included, but to avoid
confusion, we do not put these in the export file. They are however available
in the state files.


Which classifier should I choose in ASReview LAB?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In ASReview, you need to choose which classifier you want to use to
predict relevancy of your documents. Currently, we always advise to use
the naive Bayes classifier since it performs very well and needs little
computation time. We have performed several simulation studies to
evaluate performance of different classifiers on several datasets. The
results can be viewed
`here <https://asreview.readthedocs.io/en/latest/simulation_study_results.html>`__.
We do not advise specific classifiers for specific jobs because we’ve
not found enough evidence (yet) to make such recommendations.

How to check which version of ASReview I have installed?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can check which version of ASReview you are using by running the
following in your CLI:

.. code:: bash

  asreview --version

or open asreview LAB and click on the left menu.

How to upgrade my ASReview installation?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Please see the `upgrade section on the installation page <installation.html#upgrade-asreview>`__.

I had already started labeling before I came across ASReview. How can I keep my former screening decisions when starting a new project in ASReview?
~~~~~~~~~

You can keep your former labeling decisions by adding an extra column in
your dataset called ‘included’ or ‘label\_included’. In this column, you
can indicate previous screening decisions on records with 0s
(irrelevant) and 1s (relevant). ASReview will use this information to
train the model.

How can I make my previously labeled records red, like in the example datasets?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can explore a previously labeled dataset in ASReview LAB by adding
an extra column called ‘debug\_label’, indicating the relevant and
irrelevant records with ones and zeroes.


How to remove duplicate publications
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

One can use software like EndNote to remove duplicates. See the following article for examples.
`https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4915647/ <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4915647/>`__



Useful sources
--------------

Creating a dataset:

-  How to search for literature in Evidence Based
       Medicine:\ `https://libguides.library.uu.nl/c.php?g=202244&p=1330312 <https://libguides.library.uu.nl/c.php?g=202244&p=1330312>`__

-  `https://onlinelibrary.wiley.com/doi/pdf/10.1002/jrsm.1378 <https://onlinelibrary.wiley.com/doi/pdf/10.1002/jrsm.1378>`__


