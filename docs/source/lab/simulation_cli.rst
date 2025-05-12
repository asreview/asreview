Simulation via command line
===========================

ASReview LAB comes with a command line interface for simulating the
performance of ASReview algorithm.

.. _simulation-cli-getting-started:

Getting started
---------------

The simulation command line tool can be accessed directly like:

.. code-block:: bash

	asreview simulate MY_DATASET.csv -o MY_SIMULATION.asreview

This performs a simulation with the default active learning model, where
``MY_DATASET.csv`` is the path to the :ref:`lab/data_labeled:Fully labeled data`
you want to simulate. The result of the simulation is stored, after a successful
simulation, at ``MY_SIMULATION.asreview`` where ``MY_SIMULATION`` is the
filename you prefer and the extension is ``.asreview`` (ASReview project file
extension).

Simulation progress
-------------------

The progress of the simulation is given with two progress bars. The top one is
used to count the number of relevant records found. The bottom one monitors the
number of records labeled. By default (see ``--n-stop``), the simulation stops
once the the top progress bar reaches 100%.

.. code-block:: bash

    Relevant records found: 100%|█████████████████████████████████████████████████████████| 38/38 [00:04<00:00,  7.83it/s]
    Records labeled       :   7%|███▊                                                  | 322/4544 [00:04<01:03, 66.37it/s]

    Loss: 0.021
    NDCG: 0.530

Command line arguments for simulating
-------------------------------------

The command ``asreview simulate --help`` provides an overview of available
arguments for the simulation. Each of the sections below describe the available
arguments. The example below shows how you can set the command line arguments.

.. code-block:: bash

    asreview simulate MY_DATASET.csv -o MY_SIMULATION.asreview -q max_random


Dataset
~~~~~~~

.. option:: dataset

    Required. File path or URL to the dataset or one of the SYNERGY datasets.

You can also use one of the :ref:`SYNERGY dataset <lab/data_labeled:fully
labeled data>`. Use the following command and replace ``DATASET_ID`` by the
dataset ID.

.. code:: bash

    asreview simulate synergy:DATASET_ID

For example:

.. code:: bash

    asreview simulate synergy:van_de_schoot_2018 -o myreview.asreview


Active learning
~~~~~~~~~~~~~~~

.. option:: --ai AI

    The AI to simulate with. Default is :code:`elas_u4`.

.. option:: -c, --classifier CLASSIFIER

    The classifier for active learning. Default is Naive Bayes (:code:`nb`).

.. option:: -q, --querier QUERIER

    The querier for active learning. Default is Maximum (:code:`max`).

.. option:: -b, --balancer BALANCER

    Data rebalancing strategy mainly for RNN methods. Helps against imbalanced
    datasets with few inclusions and many exclusions. Default is
    :code:`balanced`.

.. option:: -e, --feature-extractor FEATURE_EXTRACTOR

    Feature extraction algorithm. Some combinations of feature extractors and
    classifiers are not supported or feasible. Default is TF-IDF
    (:code:`tfidf`).

.. option:: --seed SEED

    Seed for the model (classifiers, balance strategies, feature extraction
    techniques, and query strategies).

.. option:: --prior-seed PRIOR_SEED

    Seed for selecting prior records if the ``--prior-idx`` option is not used.
    If the option ``--prior-idx`` is used with one or more indices, this option
    is ignored.

.. option:: --embedding EMBEDDING_FP

    File path of embedding matrix. Required for LSTM models.


Prior knowledge
~~~~~~~~~~~~~~~

By default, the model initializes with no prior included or excluded records.
You can set the number of priors by ``--n-prior-included`` and
``--n-prior-excluded``. Alternatively, you can initialize your model with a
specific set of starting papers using ``--prior-idx`` or ``--prior-record-id``
to select the indices or record IDs of the papers you want to start the
simulation with.

The following options can be used to label prior knowledge:

.. option:: --n-prior-included N_PRIOR_INCLUDED

    Sample n prior included records. Only used when ``--prior-idx`` is not
    given. Default 0.

.. option:: --n-prior-excluded N_PRIOR_EXCLUDED

    Sample n prior excluded records. Only used when ``--prior-idx`` is not
    given. Default 0.

.. option:: --prior-idx [PRIOR_IDX [PRIOR_IDX ...]]

    Prior indices by row number (row numbers start at 0).

.. option:: --prior-record-id [PRIOR_RECORD_ID [PRIOR_RECORD_ID ...]]

    Prior indices by record ID.


Simulation setup
~~~~~~~~~~~~~~~~

.. option:: --n-query N_QUERY

    Number of records queried each query. Default 1.

.. option:: --n-stop N_STOP

    The number of label actions to simulate. If not set, simulation stops after
    the last relevant record is found. Use -1 to simulate all label actions.

.. option:: --config-file CONFIG_FILE

    Configuration file for the learning cycle.


Results
~~~~~~~

.. option:: --output OUTPUT, -o OUTPUT

    Location to ASReview project file of simulation.

.. option:: --verbose VERBOSE, -v VERBOSE

    Verbosity level.


Algorithms
----------

The command line interface provides an easy way to get an overview of all
available active learning model elements (classifiers, query strategies, balance
strategies, and feature extraction algorithms) and their names for command line
usage in ASReview LAB. The following command lists the available
models:

.. code:: bash

    asreview algorithms

The command includes models added via :doc:`../technical/extensions`. See
:doc:`../technical/extensions` for more information on developing new models
and install them via extensions.

Use :code:`pip install asreview-dory` to get access to all Dory models. The Dory
extension contains a collection of New and Exciting MOdels.
