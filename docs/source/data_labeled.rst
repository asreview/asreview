Fully and partially labeled data
================================

ASReview LAB contains a large amount of benchmark datasets that can
be used for Exploration and Simulation. The labelled datasets are PRISMA-based reviews on
various research topics, are available under an open licence and are
automatically harvested from the `dataset repository
<https://github.com/asreview/systematic-review-datasets>`_. See `index.csv
<https://github.com/asreview/systematic-review-datasets/blob/master/index.csv>`_
for all available properties.

For tabular datasets (:doc:`e.g., CSV, XLSX <data_format>`), the dataset should
contain a column, called :ref:`label_included <column-names>` which is
filled with 1's or 0's for the records that are already screened
and is empty for the records that you still need to screen using ASReview.

For the RIS file format, the dataset is handled automatically. The label
(`ASReview_relevant`, `ASReview_irrelevant`, `ASReview_not_seen`) is stored under the
N1 (Notes) tag. If the N1 tag is missing, it will be created for each record
after importing the dataset. An example of a RIS file with N1 tag in the `ASReview
GitHub repository <https://github.com/asreview/asreview/blob/master/tests/demo_data/baseline_tag-notes_labels.ris>`_
where all records are valid. You can also find a record without a
N1 (Notes) tag defined - the tag will be created after importing to
ASReview and populated with a label.

Partially labeled data
----------------------

.. note::

	Useful for Oracle projects. Read more about :ref:`project_create:Project modes`.

Partially labeled datasets are datasets with a review decision for a subset of
the records in the dataset. A partially labeled dataset can be obtained by
exporting results from ASReview LAB or other software. It can also be
constructed given the format described above.

Partially labeled datasets are useful as the labels will be recognized by
ASReview LAB as :ref:`Prior Knowledge <project_create:Select Prior Knowledge>` and labels are used to
train the first iteration of the active learning model.

.. note::

  Merging labeled with unlabeled data should be done outside ASReview LAB, for
  example with :ref:`data:Citation Managers`.


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
labeled datasets from various domain and published open access. They can be
useful for benchmark projects such as testing the performance of new active
learning models. The datasets and their metadata are available via the
`Systematic Review Datasets
<https://github.com/asreview/systematic-review-datasets>`_ repository. In
ASReview LAB, these datasets are refered as "Benchmark Datasets".

These Benchmark Datasets are directly available in the software. During the
:ref:`project_create:Add Dataset` step of the project setup, there is a panel
with all the datasets. The datasets can be selected and used directly.
Benchmark datasets are also available via the :doc:`cli`. Use the prefix
``benchmark:`` followed by the identifier of the dataset (see `Systematic
Review Datasets <https://github.com/asreview/systematic-review-datasets>`_
repository). For example, to use the Van de Schoot et al. (2017) dataset, use
``benchmark:van_de_schoot_2017``.
