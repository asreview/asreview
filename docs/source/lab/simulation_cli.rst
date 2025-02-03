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
you want to simulate. The result of the simulation is stored, after a
successful simulation, at ``MY_SIMULATION.asreview`` where ``MY_SIMULATION``
is the filename you prefer and the extension is ``.asreview``
(ASReview project file extension).

Simulation progress
-------------------

The progress of the simulation is given with two progress bars. The top one is
used to count the number of relevant records found. The bottom one monitors
the number of records labeled. By default (with ``--n-stop min``), the
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

.. option:: -e, --feature_extraction FEATURE_EXTRACTION

    The default is TF-IDF (:code:`tfidf`). More options and details are listed
    in :mod:`asreview.models.feature_extraction`.

.. option:: -m, --model MODEL

    The default is Naive Bayes (:code:`nb`). More options and details are listed
    in :mod:`asreview.models.classifiers`.

.. option:: -q, --query_strategy QUERY_STRATEGY

    The default is Maximum (:code:`max`). More options and details are listed
    in :mod:`asreview.models.query`.

.. option:: -b, --balance_strategy BALANCE_STRATEGY

    The default is :code:`double`. The balancing strategy is used to deal with
    the sparsity of relevant records. More options and details are listed
    in :mod:`asreview.models.balance`

.. option:: --seed SEED

    To make your simulations reproducible you can use the ``--seed`` and
    ``--prior-seed`` options. 'prior_seed' controls the starting set of papers
    to train the model on, while the 'seed' controls the seed of the random
    number generation that is used after initialization.

.. option:: --embedding EMBEDDING_FP

    File path of embedding matrix. Required for LSTM models.


Prior knowledge
~~~~~~~~~~~~~~~

By default, the model initializes with one relevant and one irrelevant record.
You can set the number of priors by ``--n-prior-included`` and
``--n-prior-excluded``. However, if you want to initialize your model with a
specific set of starting papers, you can use ``--prior-idx`` to select the
indices of the papers you want to start the simulation with. When no prior
knowledge is assigned (using ``--n-prior-included 0 --n-prior-excluded 0``),
the first records from the dataset are employed as priors in the order they
were provided until the first 0 and 1 are encountered.

The following options can be used to label prior knowledge:

.. option:: --n-prior-included N_PRIOR_INCLUDED

    The number of prior included papers. Only used when :code:`prior_idx` is
    not given. Default 1.

.. option:: --n-prior-excluded N_PRIOR_EXCLUDED

    The number of prior excluded papers. Only used when :code:`prior_idx` is
    not given. Default 1.


.. option:: --prior-idx [PRIOR_IDX [PRIOR_IDX ...]]

    Prior indices by rownumber (rownumbers start at 0).


.. option:: --prior-seed prior_seed

    Seed for setting the prior indices if the prior_idx option is not used. If
    the option prior_idx is used with one or more index, this option is
    ignored.



Simulation setup
~~~~~~~~~~~~~~~~

.. option:: --n_query n_query

    Controls the number of records to be labeled before the model is
    retrained. Increase ``n_query``, for example, to reduce the time it
    takes to simulate. Default 1.

.. option:: --n-stop n_stop

    The number of label actions to simulate. Default, 'min' will stop
    simulating when all relevant records are found. Use -1 to simulate all
    labels actions.


Save
~~~~


.. option:: --state_file STATE_FILE, -o STATE_FILE

    Location to ASReview project file of simulation.


Algorithms
----------

The command line interface provides an easy way to get an overview of all
available active learning model elements (classifiers, query strategies,
balance strategies, and feature extraction algorithms) and their names for
command line usage in ASReview LAB. It also includes models added
via :doc:`../technical/extensions_dev`. The following command lists
the available models:

.. code:: bash

    asreview algorithms

See :doc:`../technical/extensions_dev` for more information on developing new models
and install them via extensions.

Some models require additional dependencies to be installed. Use
:code:`pip install asreview[all]` to install all additional dependencies
at once or check the installation instruction in the :doc:`../technical/reference/asreview`.
