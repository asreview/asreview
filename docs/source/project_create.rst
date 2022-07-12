****************
Create a project
****************

To start reviewing a dataset with ASReview LAB, you first need to create a
project. The project will contain your dataset, settings, labeling decisions,
and machine learning models. You can choose from three different project
types: Oracle, Exploration, and Simulation. The project setup consists of
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

In this step, you have to select a mode. The default is "Oracle". Most users
are looking for this one. Oracle mode is used to screen an unlabeled dataset
(it's fine if you already have some labels) with the help of AI. The other two
modes, Simulation, and Exploration require fully labeled datasets. They are
useful for experts studying the performance of active learning or
demonstrating the workings of active learning and ASReview.

In short:

- You have an unlabeled dataset (a few labels is fine) -> Oracle
- You have a :ref:`data_labeled:Fully labeled data` -> Simulation or Exploration.

.. figure:: ../images/setup_project_modes.png
   :alt: Project modes


Project details
---------------

Provide project details like name of the project, authors (for example, the
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
offered the following options for adding a dataset. Keep in mind that in Oracle
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
work. This knowledge is used to train the first model. In this step, you need
to provide **at least** one relevant and one irrelevant record in your
dataset. To facilitate this, it is possible to search within your dataset.
This is especially useful for finding records that are relevant based on your
prior knowledge or expertise. You can also let ASReview LAB present you a
couple of random documents. This can be useful for finding irrelevant records.

The interface works as follows; on the left, you will see methods to find
records to use as prior knowledge, on the right, you will see your selected
prior knowledge. If you have **at least** one relevant and one irrelevant
record, you can click *Close* and go to the next step.

.. figure:: ../images/setup_prior.png
   :alt: ASReview prior knowledge selector


Search
~~~~~~

Let's start with finding a prior relevant document. The most efficient way
to do this is by searching for a specific document that you already know is
relevant. Click on Search and search your dataset by authors,
keywords or title, or a combination thereof. Make sure to be precise
with the search terms, as only the first 10 results are shown to you.
After entering your search terms, press enter to start searching.


.. figure:: ../images/setup_prior_search_empty.png
   :alt: ASReview prior knowledge search


Click the document you had in mind and answer, "Is this record relevant?".
Note, don't label all items here. Only the one you are looking for.

The prior knowledge will now show up on the right. There are no restrictions
on the number of publications you provide but preferably provide 1-5
relevant records. If you are done, click *Close*.

.. figure:: ../images/setup_prior_search_1rel.png
   :alt: ASReview prior knowledge search 1 relevant

Random
~~~~~~

You also need to provide at least one prior irrelevant document. You can do
this by searching it, but this can be challenging as you don't know what you
are looking for. One way to find an irrelevant document is by labeling a set
of random records from the dataset. Given that the majority of records in the
dataset are irrelevant (extremely imbalanced data problem), the records
presented here are likely to be irrelevant for your study. Click on random to
show a few random records. Indicate for each document whether it is relevant
or irrelevant.

.. figure:: ../images/setup_prior_random_1rel.png
   :alt: ASReview prior knowledge random

The prior knowledge will now show up on the right. Use the buttons to see all
prior knowledge or irrelevant items. There are no restrictions on the
number of publications you provide but preferably provide 1-5 relevant
records. If you are done, click *Close*.

After labeling a couple of randomly selected records, ASReview LAB will ask
you whether you want to stop. Click on **STOP** and click **Next**.

Model
=====

In the next step of the setup, you can select a model. The default settings
(Naïve Bayes, TF-IDF, Max) have fast and excellent performance. Most users can
skip this step and click *Next*.

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
modeling quicker.

During the screening phase, it is not possible to change the model. However,
it is possible to select a first model, screen part of the data, and export
the dataset with the labeling decisions of the first model. This
partly-labeled dataset can be imported into a new project and the labels based
on the first model will be recognized as prior knowledge. Then, a second model
can be trained on the partly-labeled data, and the new predictions will be
based on the second model.


Warm up
=======

In the last step of the setup, step 4, ASReview LAB trains a model and ranks
the records in your dataset. Depending on the model and the size of your
dataset, this can take a couple of minutes (or even longer). After the project
is successfully initialized, you can start reviewing.

.. note::

  In Simulation mode, this step starts the simulation. As simulations usually
  take longer to complete, the simulation will run in the background. After a
  couple of seconds, you will see a message and a button "Got it". You will
  navigate to the :ref:`progress:Analytics` page, where you can follow the
  progress (see *Refresh* button on the top right)

.. figure:: ../images/setup_warmup.png
   :alt: ASReview LAB warmup
