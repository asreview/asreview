Create a project
================

To start reviewing a dataset with ASReview LAB, you first need project to
create a project. The project will contain your dataset, settings, labeling decisions, and machine learning models.

Click on the Create on the bottom left to start the creation of a project. The setup of a project consist of 4 steps: Project information, Data, Model, and Warm up. The sections below explain each of the steps of the setup.

Project information
-------------------



Project modes
~~~~~~~~~~~~~


.. figure:: ../../images/setup_project_modes.png
   :alt: Project modes


Next, provide a project name (obligatory), your name and a short description
on your systematic review project.


Data
----


Add Dataset
~~~~~~~~~~~

To select a dataset:

1. Open ASReview LAB.
2. Start a new project.
3. Click the *Start Setup* button.
4. Choose one of the four options to select a dataset and click upload:

.. figure:: ../../images/asreview_prescreening_datasets.png
   :alt: ASReview dataset selector

.. warning::

    If you upload your own data, make sure to remove duplicates and to retrieve
    as many abstracts as possible (`don't know how?
    <https://asreview.nl/blog/the-importance-of-abstracts/>`_). With clean data you
    benefit most from what :doc:`active learning <../guides/activelearning>`
    has to offer.


From File
~~~~~~~~~

Upload your file by *Drag 'n' Drop*, or select your file via the browser.
The data needs to adhere to a :doc:`specific format<../intro/datasets>`. If a
file is uploaded and recognized as one of the available formats, it will
display the message *Successful upload* and state the number of records in
the dataset.

From URL
~~~~~~~~

Fill in a link to a file on the Internet. For example, a link from this
`dataset repository <https://github.com/asreview/systematic-review-datasets>`__.

From Extension
~~~~~~~~~~~~~~

Select a file available via an extension like the :doc:`COVID-19 extension <../extensions/extension_covid19>`.

Benchmark Datasets
~~~~~~~~~~~~~~~~~~

Select one of the :ref:`benchmark datasets <benchmark-datasets>`.



.. _select-prior-knowledge:

Select Prior Knowledge
~~~~~~~~~~~~~~~~~~~~~~

The first iteration of the :doc:`active learning cycle
<../guides/activelearning>` requires prior knowledge to work. This knowledge
is used to train the first model. In this step you need to provide at least
one relevant and one irrelevant document. To facilitate this, it is possible
to search within your dataset (for finding prior relevant papers) or ask the
software to present a couple of random documents (for prior irrelevant
papers).

1. Open ASReview LAB.
2. Start a new project.
3. Click the *Start Setup* button.
4. Select a dataset.
5. Click **Search** or **Random** to select your prior knowledge.


.. figure:: ../../images/asreview_prescreening_prior.png
   :alt: ASReview prior knowledge selector

After selecting some prior information, you can click **Next**.

.. figure:: ../../images/asreview_prescreening_prior_next.png
   :alt: ASReview prior knowledge selector next


Search
~~~~~~

Let's start with finding a prior relevant document. The most efficient way
to do this is by searching for a specific document which you already know is
relevant. Click the search button and search your dataset by authors,
keywords or title, or a combination thereof. Make sure to be precise
with the search terms, as only the first 10 results are shown to you.
After entering your search terms, press 'enter' to start searching.



.. figure:: ../../images/asreview_prescreening_prior_search.png
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

.. figure:: ../../images/asreview_prescreening_prior_random.png
   :alt: ASReview prior knowledge random

After labeling a couple of randomly selected documents, ASReview LAB will
ask you whether you want to stop. Click on **STOP** and click **Next**.


.. _select-model:

Select Model
------------

It is possible to change the settings of the Active learning model. There are
three ingredients that can be changed in the software: the type of classifier,
the query strategy and the feature extraction technique.

To change the default setting:

1. Open ASReview LAB.
2. Start a new project, upload a dataset and select prior knowledge.
3. Click on the **edit** icon (top right).
4. Using the drop-down menu select a different classifier, query strategy or feature extraction technique.
5. Click Finish.


.. figure:: ../../images/asreview_prescreening_model.png
   :alt: ASReview model


The classifier is the machine learning model used to compute the relevance
scores. The available classifiers are Naive Bayes, Support Vector
Machine, Logistic Regression, and Random Forest. More classifiers can be
selected via the :doc:`API <../API/reference>`. The default is Naive Bayes,
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





If you want to continue with an existing project, simply click on the title.

.. figure:: ../../images/v0.14_04_overview_projects.png
   :alt: Project overview




Import a Project
----------------

Another option is to import an ASReview project file (``.asreview``
extension). Usually, this is a project exported from ASReview LAB via the
:ref:`export-project` panel. Importing can be done by
clicking the red button in the bottom right corner of the home page. In the
pop-up screen choose the project file from your computer and click `Import`.
After a successful project initialization, a project dashboard will be shown.



Project Dashboard
-----------------

After a successful project initialization, a project dashboard will be shown
and you are ready to continue with setting-up the project, like uploading data
for the :doc:`oracle` or the :doc:`exploration`. The other options in the
project dashboard are described in the :doc:`features section
<../features/post_screening>`.


.. figure:: ../../images/v0.18_03_project_dashboard_empty.png
   :alt: Project dashboard in setup stage
