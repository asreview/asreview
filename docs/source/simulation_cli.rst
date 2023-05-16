Simulation via command line
===========================

ASReview LAB comes with a command line interface for simulating the
performance of ASReview algorithm.

.. _simulation-cli-getting-started:

Getting started
---------------

The simulation command line tool can be accessed directly like:

.. code-block:: bash

	asreview simulate MY_DATASET.csv -s MY_SIMULATION.asreview

This performs a simulation with the default active learning model, where
``MY_DATASET.csv`` is the path to the :ref:`data_labeled:Fully labeled data`
you want to simulate. The result of the simulation is stored, after a
successful simulation, at ``MY_SIMULATION.asreview`` where ``MY_SIMULATION``
is the filename you prefer and the extension is ``.asreview``
(ASReview project file extension).

Simulation progress
-------------------

The progress of the simulation is given with two progress bars. The top one is
used to count the number of relevant records found. The bottom one monitors
the number of records labeled. By default (with ``--stop-if min``), the
simulation stops once the the top progress bar reaches 100%.

.. code-block:: bash

  Simulation started

  Relevant records found: 100%|███████████████████████████████████████████████| 43/43 [00:03<00:00, 13.42it/s]
  Records labeled       :   7%|██▉                                        | 420/6189 [00:03<00:43, 133.58it/s]

  Simulation finished

Command line arguments for simulating
-------------------------------------

The command ``asreview simulate --help`` provides an overview of available
arguments for the simulation.

Each of the sections below describe the available arguments. The example below
shows how you can set the command line arguments. This can be helpful if you
are new to the using the command line. For example, you want to change the
query strategy being used. The command line and this documentation show
``-q, --query_strategy QUERY_STRATEGY``. The default is ``max``. If you want
to change it to ``max_random``, you use:

.. code-block:: bash

    asreview simulate MY_DATASET.csv -s MY_SIMULATION.asreview -q max_random


Dataset
~~~~~~~

.. option:: dataset

    Required. File path or URL to the dataset or one of the benchmark datasets.

You can also use one of the :ref:`benchmark-datasets <data_labeled:fully
labeled data>` (see `index.csv
<https://github.com/asreview/systematic-review-datasets/blob/master/index.csv>`_
for dataset IDs). Use the following command and replace ``DATASET_ID`` by the
dataset ID.

.. code:: bash

    asreview simulate benchmark:DATASET_ID

For example:

.. code:: bash

    asreview simulate benchmark:van_de_Schoot_2017 -s myreview.asreview


Active learning
~~~~~~~~~~~~~~~

.. option:: -e, --feature_extraction FEATURE_EXTRACTION

    The default is TF-IDF (:code:`tfidf`). More options and details are listed
    in the reference documentation for :doc:`/generated/asreview.models.feature_extraction`.

.. option:: -m, --model MODEL

    The default is Naive Bayes (:code:`nb`). More options and details are listed
    in the reference documentation for :doc:`/generated/asreview.models.classifiers`.

.. option:: -q, --query_strategy QUERY_STRATEGY

    The default is Maximum (:code:`max`). More options and details are listed
    in the reference documentation for :doc:`/generated/asreview.models.query`.

.. option:: -b, --balance_strategy BALANCE_STRATEGY

    The default is :code:`double`. The balancing strategy is used to deal with
    the sparsity of relevant records. More options and details are listed
    in the reference documentation for :doc:`/generated/asreview.models.balance`.

.. option:: --seed SEED

    To make your simulations reproducible you can use the ``--seed`` and
    ``--init_seed`` options. 'init_seed' controls the starting set of papers
    to train the model on, while the 'seed' controls the seed of the random
    number generation that is used after initialization.

.. option:: --embedding EMBEDDING_FP

    File path of embedding matrix. Required for LSTM models.


Prior knowledge
~~~~~~~~~~~~~~~

By default, the model initializes with one relevant and one irrelevant record.
You can set the number of priors by ``--n_prior_included`` and
``--n_prior_excluded``. However, if you want to initialize your model with a
specific set of starting papers, you can use ``--prior_idx`` to select the
indices of the papers you want to start the simulation with.

.. option:: --n_prior_included N_PRIOR_INCLUDED

    The number of prior included papers. Only used when :code:`prior_idx` is
    not given. Default 1.

.. option:: --n_prior_excluded N_PRIOR_EXCLUDED

    The number of prior excluded papers. Only used when :code:`prior_idx` is
    not given. Default 1.


.. option:: --prior_idx [PRIOR_IDX [PRIOR_IDX ...]]

    Prior indices by rownumber (rownumbers start at 0).


.. option:: --init_seed INIT_SEED

    Seed for setting the prior indices if the prior_idx option is not used. If
    the option prior_idx is used with one or more index, this option is
    ignored.



Simulation setup
~~~~~~~~~~~~~~~~

.. option:: --n_instances N_INSTANCES

    Controls the number of records to be labeled before the model is
    retrained. Increase ``n_instances``, for example, to reduce the time it
    takes to simulate. Default 1.

.. option:: --stop_if STOP_IF

    The number of label actions to simulate. Default, 'min' will stop
    simulating when all relevant records are found. Use -1 to simulate all
    labels actions.


Save
~~~~


.. option:: --state_file STATE_FILE, -s STATE_FILE

    Location to ASReview project file of simulation.


Algorithms
----------

The command line interface provides an easy way to get an overview of all
available active learning model elements (classifiers, query strategies,
balance strategies, and feature extraction algorithms) and their names for
command line usage in ASReview LAB. It also includes models added
via :doc:`extensions_overview`. The following command lists
the available models:

.. code:: bash

    asreview algorithms

See :ref:`develop-extensions` for more information on developing new models
and install them via extensions.

Some models require additional dependencies to be installed. Use
:code:`pip install asreview[all]` to install all additional dependencies
at once.
