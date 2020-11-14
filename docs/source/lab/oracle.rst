Oracle Mode
===========

This is a quick tour in using the ASReview LAB software in Oracle Mode, which
is the user- friendly frontend for active learning in systematic reviews for
unlabelled data with interaction by the user. A more elaborate instruction can
be found on our `blogpost <https://asreview.nl/asreview-class-101/>`_

This tutorial assumes you have already installed Python and ASReview. If this
is not the case, check out the :doc:`../intro/installation` page.
Also, you should have created a :doc:`project<launch>` and selected **Oracle** mode.

.. contents:: Table of Contents



Select Dataset
--------------

Select the dataset you want to use, which should contain at least the
titles and/or abstracts of all documents or records you want to screen.

There are four ways to select a dataset:

- Upload your own dataset. Read more about the format on :doc:`../intro/datasets`.
- Import a dataset with an URL.
- Select a dataset from an :doc:`extension <../plugins/overview_plugins>` (for example to use the :doc:`COVID-19 extension <../plugins/covid19>`).
- Choose one of the built-in :doc:`built-in data sets <exploration>`.

.. figure:: ../../images/2_select_dataset.png
   :alt:

After a successfull upload of the data, move to the next step.


.. figure:: ../../images/2_select_dataset_success.png
   :alt:


Select Prior Knowledge
----------------------

The first iteration of the active learning cycle requires some prior knowledge
to work. This knowledge is used to train the first model. In this step you
need to provide at least one relevant and one irrelevant document. To
facilitate this, it is possible to search within your dataset (for finding
prior relevant papers) or ask the software to present a couple of random
documents (for prior irrelevant papers).


.. figure:: ../../images/3_start.png
   :alt:

Let's start with finding a prior relevant document. Probabily the most
efficient way to do this is by searching for a document you already know is
relevant. Click the search button and search your dataset by authors, keywords
or title, or a combination thereof. Enter your search terms (Use 'enter' to
start searching).


.. figure:: ../../images/3_include_publications.png
   :alt:

|

Click the document you had in
mind and click Relevant (Clicking Irrevant results in an irrelevant document).


.. figure:: ../../images/3.3_include_search.png
   :alt:

|

The Prior Knowledge step will now show 1 relevant document. This is already
enough to  proceed to the next step. Note that there are no restrictions on
the number of publications you need to provide, but preferably provide 1-5
relevant documents.


.. figure:: ../../images/3_3relevant.png
   :alt:

You also need to provide at least one prior irrelevant document and we will
use the random option. Given that the majority of documents in the dataset is
probably irrelevant (extreme inbalanced data problem), the documents presented
here will most probable be irrelevant for your study. Click on random to and a
couple of random documents will be shown. Indicate for each document whether
it is relevant or irrelevant.


.. figure:: ../../images/4_label_random_2.png
   :alt:

After labeling a couple of randomly selected documents, ASReview LAB will
ask you whether you want to stop. Click on Stop and go to the next step.


.. figure:: ../../images/4_label_random_next.png
   :alt:



Select Active Learning Model
----------------------------

In the final step of the setup, you can select a model by chosing a
combination of a classifier, query strategy, and feature extraction technique.
The defaults are Naive Bayes, certainty-based sampling, and TF-IDF. After
choosing your model, click on `Finish`. You will return to the project page
and the model is trained for the first time.


[SCREENSHOT NEEDED]

Start Reviewing
---------------

As soon as the model is ready, a button appears with **Start Review**. Click
the button to start screening.


.. figure:: ../../images/5.1_start_reviewing.png
   :alt:


ASReview LAB presents you a document for you to
screen and label. If you have selected certainty-based sampling it will be the
document with the highest relevance score.

You are asked to make a decision: relevant or irrelevant?


[NEW SCREENSHOT NEEDED WITHOUT STATISTICS PANEL]

While you review the documents, the software continuously improves its
understanding of your decisions, constantly updating the underlying model.

As you keep reviewing documents and providing more labels, the number of
unlabeled docuemtns left in the dataset will decline. When to stop is left to
the user and we provide some tips in our `blogpost <https://asreview.nl/asreview-class-101/>`_.


Download Results
----------------

During the screening or via the dashboard you can download the results by
clicking the download icon. A dialog will show the download options.


.. figure:: ../../images/7_exporting.png
   :alt:



Choose from the menu whether you would like to download your results as a CSV or
an Excel file and click `Download`. A file is downloaded with the results of
your review.


Export project
--------------

Export the project as an ``.asreview`` file by clicking `Export this project`
in the publication zone. A project file is downloaded which can be imported
later on, or shared with others.


.. figure:: ../../images/7.1_exporting.png
   :alt:

