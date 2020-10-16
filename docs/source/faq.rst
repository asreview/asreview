Frequently Asked Questions
==========================

General questions
-----------------

.. _which-version:

How to check which version of ASReview I have installed?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Open asreview LAB and click on the left menu. The version number is displayed
on top. You can also check the version of ASReview by running the
following in your command line:

.. code:: bash

  asreview --version

How to upgrade my ASReview installation?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Please see the `upgrade section on the installation page <installation.html#upgrade-asreview>`__.


ASReview LAB & systematic reviewing
-----------------------------------

What parts of my Systematic Review project does ASReview support?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ASReview LAB is designed to optimize the Screening phase of your
systematic review, e.g. screening titles and abstracts of a large number
of publications. For the Identification phase, we recommend you to use
your current databases and reference managers,or to distribute the work
among your colleagues. You can import your records into ASReview, screen
them, and import the results back into your own tools.

.. _asreview-other-use-cases:

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

Also see `Can we use ASReview LAB also to screen based on full text? <faq.html#can-we-use-asreview-lab-also-to-screen-based-on-full-text>`__

Can we use ASReview LAB as a stand-alone screener?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

(e.g. put in the prior information and let ELAS select the relevant records automatically)

No. We believe that machine learning algorithms are not good enough yet to
replace human reviewers completely in deciding which records are relevant.
Classification techniques are simply not good enough for this purpose. In
systematic reviews, all relevant publications should be seen by the
researcher. We refer to this as Researcher-in-the-loop as described in our
paper introducing ASReview https://arxiv.org/abs/2006.12166.


.. _validated:

Has the use of ASReview in systematic reviews been validated?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

See our `preprint <https://arxiv.org/abs/2006.12166>`__ for details on the
validation of our software. Our team has been working on a paper that is
currently under peer review. ASReview can lead to far more efficient reviewing
than manual reviewing, while exhibiting adequate quality. Also ASReview can be
used in combination with traditional approaches to systematic reviewing.

Also see:


-  :ref:`peer-reviewed`
-  :ref:`cite-asreview`

.. _peer-reviewed:

Has ASReview been used in any peer-reviewed article?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Multiple researchers have started using ASReview. At the moment, no systematic
reviews have been published using the tool, but several reviews are work in
progress. Our team has been working on a paper that is currently under peer
review.

Also see:

-  :ref:`validated`
-  :ref:`cite-asreview`

.. _cite-asreview:

How can I refer to ASReview in my paper?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you want to refer to ASReview project and research study in your paper,
please cite our pre-print on `ArXiv <https://arxiv.org/abs/2006.12166>`__. We
ask users of the software to cite the used version of our software. See
https://doi.org/10.5281/zenodo.3345592 for a persistent link to our software.

ASReview LAB
------------

Can the tool be used in combination with any (academic) database?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes it can. You will have to export data from a database yourself, and
import these into ASReview. For supported databases and formats, please
read the `documentation on creating datasets <datasets.html>`__.

.. _no-abstract:

How to deal with records that do not have abstracts?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Some records simply do not have abstracts. In case of missingness, we advise
you to (quickly) screen unseen records with missing abstracts manually once
you have finished screening with ASReview. However, it is very important for
the performance of ASReview to have as little missing data as possible. We
have written a `blogpost <https://asreview.nl/the-importance-of-abstracts/>`__
on how the absence of abstracts impacts your review and how you can retrieve
missing abstracts. If you want to screen books, you can use the summary of the
book as an abstract.


How does the tool handle quality and standardisation of abstracts? Is this accounted for in any way in training the machine learning model?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The texts of the documents are handled as is, there is no attempt to
differentiate between e.g. different parts of abstracts. This could be done
with standardized abstracts - but not all abstracts are standardized.

Also see :ref:`no-abstract`

What happens if I have records from different languages?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The texts of the records are handled as is. ASReview does not
differentiate between records that use different languages. Therefore,
ASReview will have difficulty with identifying a relevant record when it
is written in a language that is different from the rest of the records
in your dataset.

Why did you choose a license that allows commercial reuse for the software?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

We believe that free and open source software is important in advancing
research. In the field of machine learning and systematic reviews,
transparency is very important to give a better understanding of the process.

What do you mean with a dataset?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A datasets is a file that contains information such as the title, abstract,
authors, doi etc. of all articles that are or have been screened.

What do you mean with a model?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A model (sometimes also referred to as a classifier) is a machine
learning model that is used to predict the relevance of the records.

How do we decide when to stop?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

At this moment, there is limited guidance on this; the decision of when to
stop is left to the user. An example stopping rule can be:

- stop after screenings 25% of the records in the dataset
- 250 irrelevant records in a row (this number can be found in the statistics panel)

Can we use ASReview LAB with multiple screeners?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Currently, we do not support collaboration of multiple users within one
project. We recommend multiple users to screen their records
independently in separate projects. Afterwards, the results can be
easily exported and combined to compare their screening decisions.

Can we use ASReview LAB also to screen full text?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ASReview LAB was originally designed for screening records with a
title and an abstract. Viewing the full text can be accomplished by
including a link to the original source of the publication by adding a
Digital Object Identifier (DOI) to your dataset (column with name 'doi'
in tabular data), which will be shown during screening. Note that the
full text will not be used to train the model. Alternatively, you are
free to put the full text into the abstract field of your dataset. When
you put full-text in the abstract field, the full-text is used for
display and training purposes.

Also see: :ref:`asreview-other-use-cases`

Which classifier should I choose in ASReview LAB?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In ASReview, you need to choose which classifier you want to use to predict
relevancy of your documents. Currently, we always advise to use the Naive
Bayes classifier since it performs very well and needs little computation
time. We have performed several simulation studies to evaluate `performance of
different classifiers on several datasets
<https://asreview.readthedocs.io/en/latest/simulation_study_results.html>`__.
We do not advise specific classifiers for specific jobs because we've not
found enough evidence (yet) to make such recommendations.

I already started labeling before I came across ASReview. How can I keep my former screening decisions when starting a new project in ASReview?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can keep your former labeling decisions by adding an extra column in
your dataset called 'included' or 'label\_included'. In this column, you
can indicate previous screening decisions on records with 0s
(irrelevant) and 1s (relevant). ASReview will use this information to
train the model.

Related question: How can I add more publications while I are already started screening in ASReview?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can export the results of ASReview you have so far and add your new
publications to this file. Make sure that for your new publications the column
`included` is empty and rename or delete the column of `record_id`.
This latter will save you from running into errors. Then simply import this
updated file to ASReview and you can continue the screening process.

Is it possible to get the inclusion likelihood for unlabelled papers?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Unfortunately, no. Getting unbiased estimates for inclusion probabilities is a
hard problem, especially in combination with active learning. Internally, we
have scores that signify which papers are more likely included, but to avoid
confusion, we do not put these in the export file. They are however available
in the state files.

How can I make my previously labeled records green, like in the example datasets?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can explore a previously labeled dataset in ASReview LAB by adding
an extra column called 'debug\_label', indicating the relevant and
irrelevant records with ones and zeroes.

How do I remove duplicate publications?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ASReview LAB works best with deduplicated datasets. One can use software like
EndNote to remove duplicates. See the following article for examples:

Bramer, W. M., Giustini, D., de Jonge, G. B., Holland, L., & Bekhuis, T. (2016). 
De-duplication of database search results for systematic reviews in EndNote. 
Journal of the Medical Library Association : JMLA, 104(3), 240–243. 
`https://doi.org/10.3163/1536-5050.104.3.014 
<https://doi.org/10.3163/1536-5050.104.3.014>`__

Third-party manuals for removing duplicates in Zotero, Mendeley, and RefWorks, 
can found in the folder **4. Deduplication** by Staaks (2020). 

Staaks, J. (2020, October 15). Systematic Review Search Support.
`https://doi.org/10.17605/OSF.IO/49T8X
<https://osf.io/yh3xe/>`__

