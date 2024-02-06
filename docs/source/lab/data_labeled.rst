Fully, partially, and unlabeled data
====================================

Fully and partially labeled datasets serve a special role in the ASReview
context. These datasets have review decisions for a subset of the records or
for all records in the dataset.

Label format
------------

For tabular datasets (:doc:`e.g., CSV, XLSX <data_format>`), the dataset
should contain a column called "included" or "label" (See :ref:`Data format
<column-names>` for all naming conventions), which is filled with ``1``'s or
``0``'s for the records that are already screened. The value is left empty
for the records that you haven't screened yet, or which are added to the
dataset in case of updating a review. For the RIS file format, the labels
``ASReview_relevant``, ``ASReview_irrelevant``, and ``ASReview_not_seen``)
can be stored with the N1(Notes) tag.

Exported files containing labeling decisions can be re-imported into ASReview
LAB whereafter all labels are recognized and its behavior is different for
each mode:

- In **Oracle mode** existing labels are used for prior knowledge.
- In **Validation mode** records are presented along with an indication of their previous labeling status: relevant, irrelevant, or not seen. This status is displayed via a color-coded bar above each record.
- In **Simulation**  the column containing the labels is used to simulate a systematic review.


Unlabeled data
--------------

Unlabeled datasets do not contain any labels and can be used in the **Oracle
mode** to start a review from scratch. Prior knowledge has to be selected in
the :ref:`Prior Knowledge <lab/project_create:Prior Knowledge>` step of the project set-up.

Partially labeled data
----------------------

Partially labeled datasets are datasets with a labeling decision for a subset
of the records in the dataset and no decision for another subset.

In **Oracle mode**, if labels are available for a part of the dataset, the
labels will be automatically detected and used for :ref:`Prior Knowledge
<lab/project_create:Prior Knowledge>`. The first iteration of the model
will then be based on these decisions and used to predict relevance scores
for the unlabeled part of the data. It is usefull when a large number of
records is needed for training, or when  updating a systematic review, or to
continue the screening process with `model switching <https://doi.org/10.3389/frma.2023.1178181>`_.

In **Validation mode**, the labels available are presented in the review
screen along with an indication of their previous labeling status: relevant,
irrelevant, or not seen. This status is displayed via a color-coded bar above
each record, and you have the opportunity to refine the dataset by correcting
any potential misclassifications, useful for the quality evaluation(see, for
example, the `SAFE procedure <https://www.researchsquare.com/article/rs-2856011/>`_).

.. note::

  Merging labeled with unlabeled data should be done outside ASReview LAB, for
  example, with the `compose <https://github.com/asreview/asreview-datatools>`_
  function of ASReview Datatools, or via :ref:`lab/data:Citation Managers`.


Fully labeled data
------------------

Fully labeled datasets are datasets with a labeling decision for all records
in the dataset.

In **Simulation mode**, the labels are used for mimicking the review proces
for a :doc:`Simulation study<simulation_overview/>`. Only records containing
labels are used for the simulation, unlabeled records are ignored.

In **Validation mode**, the labels available in a fully labeled dataset are
presented in the review screen along with an indication of their previous
labeling status: relevant or irrelevant. It is usefull to validate labels as
a human when the labels are predicted by a large language model (LLM), like
by ChatGPT. Also, one can use this mode for teaching purporses.

Benchmark datasets
~~~~~~~~~~~~~~~~~~

The `ASReview research project <https://asreview.ai/about/>`_ collects fully
labeled datasets published open access. The labeled datasets are PRISMA-based
systematic reviews or meta-analyses on various research topics. They can be
useful for teaching purposes or for testing the performance of (new) active
learning models. The datasets and their metadata are available via the
`SYNERGY Dataset <https://github.com/asreview/synergy-dataset>`_ repository.
In ASReview LAB, these datasets are found under "Benchmark Datasets"; only
available for the Validation and Simulation modi.

The Benchmark Datasets are directly available in the software. During the
:ref:`lab/project_create:Add Dataset` step of the project setup, there is a panel
with all the datasets. The datasets can be selected and used directly.
Benchmark datasets are also available via the :doc:`simulation_cli`. Use the prefix
``synergy:`` followed by the identifier of the dataset (see `Synergy Dataset <https://github.com/asreview/synergy-dataset>`_
repository). For example, to use the Van de Schoot et al. (2018) dataset, use
``synergy:van_de_schoot_2018``.
