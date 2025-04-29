Start a review
==============

To start reviewing a dataset with ASReview LAB, you create a project containing
a dataset with records to screen. The project will contain your dataset,
settings, labeling decisions, and machine learning models.

To start a review project, you need to:

1. :doc:`start`.
2. Go to the *Projects overview* if you are not already there (http://localhost:5000/reviews)
3. Upload, select, or choose a dataset to screen.

Dataset
-------

Click on *Add* to select a dataset. The data needs to adhere to a
:doc:`specific format <data>`. Keep in mind that in
Oracle mode, your dataset is unlabeled or :ref:`lab/data_labeled:Partially
labeled data`; in Validation mode :ref:`lab/data_labeled:Partially labeled data` or
fully labeled; and for Simulation mode, you need :ref:`lab/data_labeled:Fully
labeled data`.

.. tip::

    You will benefit most from what active learning has to offer with :ref:`lab/data:High-quality data`.

Depending on the :ref:`Project mode <lab/project_create:Project modes>`, you are
offered different options for adding a dataset:

From File
~~~~~~~~~

Drag and drop your file or select your file. Click on *Save* on the top right.

.. note::
    After adding your dataset, ASReview LAB shows the approximate number of duplicates.
    This number is based on duplicate titles and abstracts and if available, on the Digital Object Identifier (`DOI <https://www.doi.org/>`_).
    Removing duplicates can be done via `ASReview Datatools <https://github.com/asreview/asreview-datatools>`_,
    which also allows using a persistent identifier (PID) other than DOI for
    identifying and removing duplicates.


From URL or DOI
~~~~~~~~~~~~~~~

Insert a URL to a dataset. For example, use a URL from this
`dataset repository <https://github.com/asreview/synergy-dataset>`__.
It is also possible to provide a DOI to a data repository (supported for many
data repositories via `Datahugger <https://github.com/J535D165/datahugger>`__).
In a DOI points to multiple files, select the file you want to use (e.g.
`10.17605/OSF.IO/WDZH5 <https://doi.org/10.17605/OSF.IO/WDZH5>`__).

Click on *Add* to add the dataset.

From Discovery
~~~~~~~~~~~~~~

Select a file available via an extension (Oracle and Validation only). Click
on *Save* on the top right.

Benchmark Datasets
~~~~~~~~~~~~~~~~~~

Select one of the
:ref:`lab/data_labeled:benchmark datasets` (Simulation and Validation only). Click
on *Save* on the top right.


Prior Knowledge
---------------

The first iteration of the active learning cycle requires training data,
referred to as prior knowledge. This knowledge is used by the classifier to
create an initial ranking of the unseen records. In this step, you need to
provide a minimum training data set of size two, with **at least** one
relevant and one irrelevant labeled record.

.. note::
  If you use :ref:`lab/data_labeled:Partially labeled data` in the Oracle mode, you can skip this step, because the labels available in the dataset are used for training the first iteration of the model.

To facilitate prior selection, it is possible to search within your dataset, or .
This is especially useful for finding records that are relevant based on
previous studies or expert consensus.

You can also let ASReview LAB present you with random records. This can be
useful for finding irrelevant records.

The interface works as follows; on the left, you will see methods to find
records to use as prior knowledge, on the right, you will see your selected
prior knowledge. If you have **at least** one relevant and one irrelevant
record, you can click *Close* and go to the next step.

.. figure:: ../../images/setup_prior.png
   :alt: ASReview prior knowledge selector


Search
~~~~~~

Let's start with finding a prior relevant document. The most efficient way
to do this is by searching for a specific document that you already know is
relevant. Click on Search and search your dataset by authors,
keywords or title, or a combination thereof. Make sure to be precise
with the search terms, as only the first 10 results are shown to you.
After entering your search terms, press enter to start searching.


.. figure:: ../../images/setup_prior_search_empty.png
   :alt: ASReview prior knowledge search


Click the document you had in mind and answer, "Is this record relevant?".
Note, don't label all items here. Only the one you are looking for and want to
use as training data.

The prior knowledge will now show up on the right. There are no restrictions
on the number of records and the software already works with 2 labels (1
relevant and 1 irrelevant).

The prior knowledge will now show up on the right. Use the buttons to see all
prior knowledge or a subset. You can also change the label or remove the
record from the training set. There are no restrictions on the number of
records you provide, and the software already works with 2 labeled records
(1 relevant and 1 irrelevant). After labeling five randomly selected records,
ASReview LAB will ask you whether you want to stop searching prior knowledge.
Click on *STOP* and click *Next*.

Inspect the records to be used for training the first iteration of the model,
and if you are done, click *Close*.

.. figure:: ../../images/setup_prior_search_1rel.png
   :alt: ASReview prior knowledge search 1 relevant

AI Model
--------

In the next step of the setup, you can select the AI model. The
default setting (ELAS ultra) have fast and excellent
performance.


Screen
------

In the last step of the setup, step 4, ASReview LAB runs the feature extractor
and trains a model, and ranks the records in your dataset. Depending on the
model and the size of your dataset, this can take a couple of minutes (or even
longer; you can enjoy the `animation video <https://www.youtube.com/watch?v=k-a2SCq-LtA>`_). After the project is successfully
initialized, you can start reviewing.

.. note::

  In Simulation mode, this step starts the simulation. As simulations usually
  take longer to complete, the simulation will run in the background. After a
  couple of seconds, you will see a message and a button "Got it". You will
  navigate to the :ref:`lab/progress:Analytics` page, where you can follow the
  progress (see *Refresh* button on the top right)

.. figure:: ../../images/setup_warmup.png
   :alt: ASReview LAB warmup
