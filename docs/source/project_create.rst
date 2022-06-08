****************
Create a project
****************

To start reviewing a dataset with ASReview LAB, you first need to create a
project. The project will contain your dataset, settings, labeling decisions,
and machine learning models. You can choose from three different project
types: Oracle, Exploration, and Simulation. The setup of a project consist of
4 steps: Project information, Data, Model, and Warm up. The sections below
explain each of the steps of the setup.

To create a project:

1. :doc:`start`.
2. Go to the *Projects dashboard* if you are not already there (http://localhost:5000/projects)
3. Click on the Create on the bottom left

Project information
===================

In this step of the project setup, step 1, you provide all relevant
information about your project as well as the type of project you want (the
mode). The sections below provide more information on the input fields. After
you complete this step, click next.

Project modes
-------------



.. figure:: ../images/setup_project_modes.png
   :alt: Project modes


Project details
---------------

Provide project details like name of the project, authors (for example the
name of the screener), and a description. You can edit these values later in
the *Details* page.


Data
====

In this step of the project setup, step 1, you import a dataset and select
prior knowledge. Read :doc:`data` for information about dataset formats. Prior
knowledge is used to come up with a first sorting of the dataset.

Add Dataset
-----------

Click on *Add* to select a dataset. The data needs to adhere to a
:doc:`specific format<data>`. You will benefit most from what active learning
has to offer with :ref:`data:High quality data`.

Depending on the :ref:`Project mode <project_create:Project modes>`, you are
offered the following options for adding a dataset. Keep in mind the in Oracle
mode, your dataset is unlabeled or :ref:`data_labeled:Partially labeled data`. For Exploration and Simulation mode, you need :ref:`data_labeled:Fully labeled
data`.

.. note::

    You will benefit most from what active learning has to offer with :ref:`data:High quality data`.


From File
~~~~~~~~~

Drag and drop your file or select your file. Click on Save on the top right.

From URL
~~~~~~~~

Use a link to a dataset on the Internet. For example, a link from this
`dataset repository
<https://github.com/asreview/systematic-review-datasets>`__. Click on Save on
the top right.

From Extension
~~~~~~~~~~~~~~

Oracle and Exploration only. Select a file available via an extension. Click
on Save on the top right.

Benchmark Datasets
~~~~~~~~~~~~~~~~~~

Simulation and Exploration only. Select one of the
:ref:`data_labeled:benchmark datasets`. Click
on Save on the top right.


Select Prior Knowledge
----------------------

The first iteration of the active learning cycle requires prior knowledge to
work. This knowledge is used to train the first model. In this step you need
to provide at least one relevant and one irrelevant document. To facilitate
this, it is possible to search within your dataset (for finding prior relevant
papers) or ask the software to present a couple of random documents (for prior
irrelevant papers).

1. :doc:`start`.
2. Start a new project.
3. Click the *Start Setup* button.
4. Select a dataset.
5. Click **Search** or **Random** to select your prior knowledge.


.. figure:: ../images/asreview_prescreening_prior.png
   :alt: ASReview prior knowledge selector

After selecting some prior information, you can click **Next**.

.. figure:: ../images/asreview_prescreening_prior_next.png
   :alt: ASReview prior knowledge selector next


The first iteration of the active learning cycle requires some prior knowledge
to work. This knowledge is used to train the first model. In this step you
need to provide at least one relevant and one irrelevant document. To
facilitate this, it is possible to :ref:`Search` within your dataset (for
finding prior relevant papers), ask the software to present a couple of
Random (for prior irrelevant papers), or to upload :ref:`data_labeled:Partially labeled data`. When searching for specific records
be sure to be precise with the search terms (use the full title of an article
for example), as only the first 10 results are shown to you.


.. figure:: ../images/asreview_prescreening_prior_next.png
   :alt: ASReview prior knowledge selector next




Search
~~~~~~

Let's start with finding a prior relevant document. The most efficient way
to do this is by searching for a specific document which you already know is
relevant. Click the search button and search your dataset by authors,
keywords or title, or a combination thereof. Make sure to be precise
with the search terms, as only the first 10 results are shown to you.
After entering your search terms, press 'enter' to start searching.



.. figure:: ../images/asreview_prescreening_prior_search.png
   :alt: ASReview prior knowledge search


Click the document you had in mind and click Relevant (Clicking Irrevant
results in an irrelevant document).

The Prior Knowledge step will now show 1 relevant document. This is already
enough to  proceed to the next step. Note that there are no restrictions on
the number of publications you need to provide, but preferably provide 1-5
relevant documents.

If you are done click **Next**.


Random
~~~~~~

You also need to provide at least one prior irrelevant document. One way to
find an irrelevant document is by labeling a set of random records from the
dataset. Given that the majority of documents in the dataset are irrelevant
(extremely imbalanced data problem), the documents presented here are likely
to be irrelevant for your study. Click on random to show a few random
documents. Indicate for each document whether it is relevant or irrelevant.

.. figure:: ../images/asreview_prescreening_prior_random.png
   :alt: ASReview prior knowledge random

After labeling a couple of randomly selected documents, ASReview LAB will
ask you whether you want to stop. Click on **STOP** and click **Next**.

Select model
============

In the next step of the setup, you can select a model. The default settings
(Naïve Bayes, TF-IDF, Max) has fast and excellent performance. Most users can skip this step and click *Next*.

Select model (advanced)
-----------------------

It is possible to change the settings of the Active learning model. There are
four ingredients that can be changed in the software: the type of classifier,
the query strategy, balance strategy, and the feature extraction technique.

The classifier is the machine learning model used to compute the relevance
scores. The available classifiers are Naive Bayes, Support Vector
Machine, Logistic Regression, and Random Forest. More classifiers can be
selected via the :doc:`API <reference>`. The default is Naive Bayes,
though relatively simplistic, it seems to work quite well on a wide range of
datasets.

The query strategy determines which document is shown after the model has
computed the relevance scores. The three options are: certainty-based, mixed and
random. When certainty-based is selected, the documents are shown in the order of
relevance score. The document most likely to be relevant is shown first. When
mixed is selected, the next document will be selected certainty-based 95% of the
time, and randomly chosen otherwise. When random is selected, documents are shown
in a random order (ignoring the model output completely). **Warning**: selecting
this option means your review is not going to be accelerated by using ASReview.

The feature extraction technique determines the method how text is translated
into a vector that can be used by the classifier. The default is TF-IDF (Term
Frequency-Inverse Document Frequency) from `SKLearn <https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html>`_.
It works well in combination with Naive Bayes and other fast training models.
Another option is Doc2Vec provided by the `gensim <https://radimrehurek.com/gensim/>`_
package which needs to be installed manually.
To use it, install the gensim package manually:

.. code:: bash

    pip install gensim

It takes relatively long to create a feature matrix with this method. However,
this only has to be done once per simulation/review. The upside of this method
is the dimension-reduction that generally takes place, which makes the
modelling quicker.

During the screening phase, it is not possible to change the model. However,
it is possible to select a first model, screen part of the data, and export
the dataset with the labeling decisions of the first model. This
partly-labeled dataset can be imported into a new project and the labels based
on the first model will be recognized as prior knowledge. Then, a second model
can be trained on the partly-labeled data, and the new predictions will be
based on the second model.


Warm up
=======
