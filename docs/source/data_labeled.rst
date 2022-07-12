Fully and partially labeled data
================================

Fully and partially labeled datasets serve a special role in the ASReview
context. These datasets have review decisions for a subset of the records or
for each record in the dataset. The labels are dichotomous: relevant or
irrelevant. :ref:`data_labeled:Partially labeled data` is useful in the Oracle
mode, whereas :ref:`data_labeled:Fully labeled data` is useful in the Simulation
and Exploration mode. See :ref:`project_create:Project modes` for more
information.

All datasets exported from ASReview LAB can be imported into ASReview LAB
again. All labels are recognized by the software. In Oracle mode, all labels
are directly added as :ref:`Prior Knowledge <project_create:Select Prior
Knowledge>`.

Labeled data format
-------------------

For tabular datasets (:doc:`e.g., CSV, XLSX <data_format>`), the dataset
should contain a column called "included" or "label" (See :ref:`Data format
<column-names>` for all naming conventions), which is filled with ``1``'s or
``0``'s for the records that are already screened. The value is left empty for
the records that you haven't screened yet.

For the RIS file format, the labels ``ASReview_relevant``,
``ASReview_irrelevant``, and ``ASReview_not_seen``) can be stored with the N1
(Notes) tag. An example of a RIS file with labels in the N1 tag can be found
in the `ASReview GitHub repository
<https://github.com/asreview/asreview/blob/master/tests/demo_data/baseline_tag-notes_labels.ris>`_.
All labels in this example are valid ways to label the data. Exported RIS file
from ASReview LAB can be imported into ASReview LAB again, and whereafter all
labels are recognized.

Partially labeled data
----------------------

.. note::

	Useful for Oracle projects. Read more about :ref:`project_create:Project modes`.

Partially labeled datasets are datasets with a review decision for a subset of
the records in the dataset. A partially labeled dataset can be obtained by
exporting results from ASReview LAB or other software. It can also be
constructed given the format described above.

Partially labeled datasets are useful as the labels will be recognized by
ASReview LAB as :ref:`Prior Knowledge <project_create:Select Prior Knowledge>`, and labels are used to
train the first iteration of the active learning model.

.. note::

  Merging labeled with unlabeled data should be done outside ASReview LAB, for
  example, with :ref:`data:Citation Managers`.


Fully labeled data
------------------

.. note::

	Useful for Simulation and Exploration projects. Read more about :ref:`project_create:Project modes`.

Fully labeled datasets are datasets with a review decision for each record in
the dataset. Fully labeled datasets are useful for exploration or simulation
purposes (see also :ref:`simulation_overview:What is a simulation?` and
:ref:`project_create:Project modes`). See :ref:`data_labeled:Benchmark
Datasets` for built-in, fully labeled datasets in ASReview LAB.


Benchmark Datasets
~~~~~~~~~~~~~~~~~~

The `ASReview research project <https://asreview.ai/about/>`_ collects fully
labeled datasets published open access. The labeled datasets are PRISMA-based
reviews on various research topics. They can be useful for benchmark projects
such as testing the performance of new active learning models. The datasets
and their metadata are available via the `Systematic Review Datasets
<https://github.com/asreview/systematic-review-datasets>`_ repository. In
ASReview LAB, these datasets are referred to as "Benchmark Datasets".

These Benchmark Datasets are directly available in the software. During the
:ref:`project_create:Add Dataset` step of the project setup, there is a panel
with all the datasets. The datasets can be selected and used directly.
Benchmark datasets are also available via the :doc:`simulation_cli`. Use the prefix
``benchmark:`` followed by the identifier of the dataset (see `Systematic
Review Datasets <https://github.com/asreview/systematic-review-datasets>`_
repository). For example, to use the Van de Schoot et al. (2017) dataset, use
``benchmark:van_de_schoot_2017``.

You can donate your dataset to the `Systematic Review Datasets
<https://github.com/asreview/systematic-review-datasets>`_ collection.

