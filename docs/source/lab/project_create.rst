Start a review
==============

To start reviewing a dataset with ASReview LAB, you create a project containing
a dataset with records to screen. The project will contain your dataset,
settings, labeling decisions, and machine learning models.

To start a review project, you need to:

1. :doc:`start`.
2. Go to the *Reviews overview* if you are not already there (http://localhost:5000/reviews)
3. Upload, select, or choose a dataset to screen.
4. Verify the dataset with from the charts. Ensure that the dataset completeness
   is sufficient.

Add Dataset
-----------

The first step in creating a project is to select a dataset. You can upload a
dataset from your computer, select a dataset from Discovery, or use a dataset
from a URL or DOI.

.. tip::

    You will benefit most from what active learning has to offer with :ref:`lab/data:High-quality data`.

From File
~~~~~~~~~

Drag and drop your file or select your file.


From URL (or DOI)
~~~~~~~~~~~~~~~~~

Provide a URL or a DOI to a dataset. Many data repositories are supported via
`Datahugger <https://github.com/J535D165/datahugger>`__. If the DOI points to
multiple files, you can select the specific file you want to use (e.g.,
`10.17605/OSF.IO/WDZH5 <https://doi.org/10.17605/OSF.IO/WDZH5>`__).

Click on *Download* to download and add the dataset to the project.

From Discovery
~~~~~~~~~~~~~~

Under Discovery, you can select a existing datasets from the `SYNERGY dataset
<https://github.com/asreview/synergy-dataset>`__ or installed dataset
extensions. The SYNERGY dataset is a collection of fully labeled datasets that
can be used, but not exclusively, to benchmark the performance of active
learning models.

More options
------------

Under *Show options*, you can select the following options:

Add Tags
~~~~~~~~

You can add tags to your records to review. Tags are useful for organizing your
records afterwards or for data extraction. You can add tags and tag groups to
your review by clicking on the *Add tags* button. You can add multiple
tags to a tag group, and you can add multiple tags to a dataset. In the current version, you
can't delete tags, so be careful with the tags you add.

Change AI Model
~~~~~~~~~~~~~~~

By default, ASReview LAB uses the ELAS ultra model. This is a fast and
efficient model that is trained on the SYNERGY dataset. You can change the
model to a different model by clicking on the dropdown button. You can
select from the following models:

- ELAS ultra
- ELAS multilingual
- ELAS heavy
- Custom

Most users will benefit from the ELAS ultra model and don't need to change
the model. The ELAS multilingual model is useful for datasets that are
multilingual or contain non-English records.

For more information about the models, see the :ref:`lab/models` page.


Prior Knowledge
~~~~~~~~~~~~~~~

In the next step, you can select prior knowledge. This is a set of records that
you know are relevant or irrelevant. This is useful for training the model
in the first iteration, as well as later iterations, of the active learning
cycle. The model will use this prior knowledge to create an initial ranking
of the records in your dataset.

.. note::

  If you use :ref:`lab/data_labeled:Partially labeled data`,
  ASReview LAB will automatically use the labeled records as prior knowledge.

Click on Search and search your dataset by authors, keywords or title, or a
combination thereof. Make sure to be precise with the search terms, as only the
first 10 results are shown to you. After entering your search terms, press enter
to start searching.

Click the result you had in mind and label it as relevant (or even irrelevant).
Avoid labeling all items; only select the ones you intend to use as training
data. Close the search window to go back to the previous screen.


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
