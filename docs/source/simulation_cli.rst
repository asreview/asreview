Simulation via command line
===========================

ASReview LAB comes with an extensive simulation interface via the command
line.

.. _simulation-cli-getting-started:

Getting started
---------------

The simulation command line tool can be accessed directly like:

.. code-block:: bash

	asreview simulate MY_DATASET.csv --state_file MY_SIMULATION.asreview

This performs a simulation with the default active learning model, where
``MY_DATASET.csv`` is the path to the fully labeled dataset you want to
simulate. The result of the simulation is stored, after a succesful
simulation, at ``MY_SIMULATION.asreview`` where ``MY_SIMULATION`` is the
filename you prefer.

You can also use one of the :ref:`benchmark-datasets
<data_labeled:fully labeled data>` (see `index.csv
<https://github.com/asreview/systematic-review-datasets/blob/master/index.csv>`_
for dataset IDs).

.. code:: bash

    asreview simulate benchmark: [dataset_id]

For example:

.. code:: bash

    asreview simulate benchmark:van_de_Schoot_2017 --state_file myreview.asreview


.. note::

	For instructions on preparing your fully labeled data, see :doc:`data`.


Simulation options
------------------

ASReview LAB provides an extensive simulation interface via the command line.

.. code:: bash

    asreview simulate [options] [dataset [dataset ...]]


When no additional arguments are specified in the ``asreview simulate``
command, default settings are used. For a list of available commands in
ASReview LAB, type :code:`asreview simulate --help`.



.. program:: asreview simulate

.. option:: dataset

    A dataset to simulate

.. option:: -m, --model MODEL

    The prediction model for Active Learning. Default: :code:`nb`. (See available
    options below: `Classifiers`_)

.. option:: -q, --query_strategy QUERY_STRATEGY

    The query strategy for Active Learning. Default: :code:`max`. (See
    available options below: `Query strategies`_)

.. option:: -b, --balance_strategy BALANCE_STRATEGY

    Data rebalancing strategy. Helps against imbalanced
    datasets with few inclusions and many exclusions. Default: :code:`double`.
    (See available options below: `Balance strategies`_)

.. option:: -e, --feature_extraction FEATURE_EXTRACTION

  Feature extraction method. Some combinations of feature extraction method
  and prediction model are not available. Default: :code:`tfidf`. (See
  available options below: `Feature extraction`_)

.. option:: --embedding EMBEDDING_FP

    File path of embedding matrix. Required for LSTM models.

.. option:: --config_file CONFIG_FILE

    Configuration file with model settings and parameter values.

.. option:: --seed SEED

  Seed for the model (classifiers, balance strategies, feature extraction
  techniques, and query strategies). Use an integer between 0 and 2^32 - 1.

.. option:: --n_prior_included N_PRIOR_INCLUDED

    The number of prior included papers. Only used when :code:`prior_idx` is not given. Default 1.

.. option:: --n_prior_excluded N_PRIOR_EXCLUDED

    The number of prior excluded papers. Only used when :code:`prior_idx` is not given. Default 1.

.. option:: --prior_idx [PRIOR_IDX [PRIOR_IDX ...]]

    Prior indices by rownumber (0 is first rownumber).

.. option:: --prior_record_id [PRIOR_RECORD_ID [PRIOR_RECORD_ID ...]]

    Prior indices by record_id.

.. option:: --state_file STATE_FILE, -s STATE_FILE

    Location to ASReview project file of simulation.

.. option:: --init_seed INIT_SEED

    Seed for setting the prior indices if the prior_idx option is not used. If the option
    prior_idx is used with one or more index, this option is ignored.

.. option:: --n_instances N_INSTANCES

    Number of papers queried each query.Default 1.

.. option:: --stop_if STOP_IF

    The number of label actions to simulate. Default, 'min' will stop
    simulating when all relevant records are found. Use -1 to simulate all
    labels actions.

.. option:: -w WRITE_INTERVAL, --write_interval WRITE_INTERVAL

    The simulation data will be written away after each set of thismany
    labeled records. By default only writes away data at the endof the
    simulation to make it as fast as possible.

.. option:: --verbose VERBOSE, -v VERBOSE

    Verbosity

.. option:: -h, --help

  Show help message and exit.



The most important options are:

- To make your simulations reproducible you can use the ``--seed`` and
  ``--init_seed`` options. 'init_seed' controls the starting set of papers to
  train the model on, while the 'seed' controls the seed of the random number
  generation that is used after initialization.

- By default, the model initializes with one relevant and one irrelevant record.
  You can set the number of priors by ``--n_prior_included`` and
  ``--n_prior_excluded``. However, if you want to initialize your model with a
  specific set of starting papers, you can use ``--prior_idx`` to select the
  indices of the papers you want to start the simulation with.

- The ``--n_instances`` argument controls the number of records that have to be
  labeled before the model is retrained, and is set at 1 by default. If
  you want to reduce the number of training iterations, for example to limit the
  size of your state file and the time to simulate, you can increase
  ``--n_instances``.

- You can select a machien learning model as classifier with the ``-m`` flag,
  which is set to be Naive Bayes by default. Names for implemented classifiers
  are listed on the :ref:`classifiers-table` table.

- Implemented query strategies are listed on the :ref:`query-strategies-table`
  table and can be set with the ``-q`` option.

- For feature extraction, supply the ``-e`` flag. Default is TF-IDF, more
  details on the table for :ref:`feature-extraction-table`.

- The last element that can be changed is the :ref:`balance-strategies-table`,
  and is changed with the ``-b`` flag. Default is double balance.


A full list of options can be found in the Development section under :ref:`cli:simulate`.  


Algorithms
----------

:program:`asreview algorithms` provides an overview of all available active
learning model elements (classifiers, query strategies, balance
strategies, and feature extraction algorithms) in ASReview.

.. code:: bash

    asreview algorithms

.. note::

    :program:`asreview algorithms` included models added via extensions.
    See :ref:`develop-extensions` for more information on extending ASReview with new
    models via extensions.


The following components of the active learning model are available:

.. note::

  Some classifiers (models) and feature extraction algorithms require additional dependecies. Use :code:`pip install asreview[all]` to install all additional dependencies at once.


.. _feature-extraction-table:

Feature Extraction
~~~~~~~~~~~~~~~~~~

+----------------+-----------------------------------------------------------+-----------------------------------------------------------------------------+
| Name           | Reference                                                 | Requires                                                                    |
+================+===========================================================+=============================================================================+
| tfidf          | :class:`asreview.models.feature_extraction.Tfidf`         |                                                                             |
+----------------+-----------------------------------------------------------+-----------------------------------------------------------------------------+
| doc2vec        | :class:`asreview.models.feature_extraction.Doc2Vec`       | `gensim <https://radimrehurek.com/gensim/>`__                               |
+----------------+-----------------------------------------------------------+-----------------------------------------------------------------------------+
| embedding-idf  | :class:`asreview.models.feature_extraction.EmbeddingIdf`  |                                                                             |
+----------------+-----------------------------------------------------------+-----------------------------------------------------------------------------+
| embedding-lstm | :class:`asreview.models.feature_extraction.EmbeddingLSTM` |                                                                             |
+----------------+-----------------------------------------------------------+-----------------------------------------------------------------------------+
| sbert          | :class:`asreview.models.feature_extraction.SBERT`         | `sentence_transformers <https://github.com/UKPLab/sentence-transformers>`__ |
+----------------+-----------------------------------------------------------+-----------------------------------------------------------------------------+

.. _classifiers-table:

Classifiers
~~~~~~~~~~~

+-------------+--------------------------------------------------------------+-----------------------------------------------+
| Name        | Reference                                                    | Requires                                      |
+=============+==============================================================+===============================================+
| nb          | :class:`asreview.models.classifiers.NaiveBayesClassifier`    |                                               |
+-------------+--------------------------------------------------------------+-----------------------------------------------+
| svm         | :class:`asreview.models.classifiers.SVMClassifier`           |                                               |
+-------------+--------------------------------------------------------------+-----------------------------------------------+
| logistic    | :class:`asreview.models.classifiers.LogisticClassifier`      |                                               |
+-------------+--------------------------------------------------------------+-----------------------------------------------+
| rf          | :class:`asreview.models.classifiers.RandomForestClassifier`  |                                               |
+-------------+--------------------------------------------------------------+-----------------------------------------------+
| nn-2-layer  | :class:`asreview.models.classifiers.NN2LayerClassifier`      |  `tensorflow <https://www.tensorflow.org/>`__ |
+-------------+--------------------------------------------------------------+-----------------------------------------------+
| lstm-base   | :class:`asreview.models.classifiers.LSTMBaseClassifier`      |  `tensorflow <https://www.tensorflow.org/>`__ |
+-------------+--------------------------------------------------------------+-----------------------------------------------+
| lstm-pool   | :class:`asreview.models.classifiers.LSTMPoolClassifier`      |  `tensorflow <https://www.tensorflow.org/>`__ |
+-------------+--------------------------------------------------------------+-----------------------------------------------+

.. _query-strategies-table:

Query Strategies
~~~~~~~~~~~~~~~~

+-----------------+---------------------------------------------------------+--------------+
| Name            | Reference                                               | Requires     |
+=================+=========================================================+==============+
| max             | :class:`asreview.models.query.MaxQuery`                 |              |
+-----------------+---------------------------------------------------------+--------------+
| random          | :class:`asreview.models.query.RandomQuery`              |              |
+-----------------+---------------------------------------------------------+--------------+
| uncertainty     | :class:`asreview.models.query.UncertaintyQuery`         |              |
+-----------------+---------------------------------------------------------+--------------+
| cluster         | :class:`asreview.models.query.ClusterQuery`             |              |
+-----------------+---------------------------------------------------------+--------------+
| max_random      | :class:`asreview.models.query.MaxRandomQuery`           |              |
+-----------------+---------------------------------------------------------+--------------+
| max_uncertainty | :class:`asreview.models.query.MaxUncertaintyQuery`      |              |
+-----------------+---------------------------------------------------------+--------------+

.. _balance-strategies-table:

Balance Strategies
~~~~~~~~~~~~~~~~~~

+-------------+---------------------------------------------------------+----------+
| Name        | Reference                                               | Requires |
+=============+=========================================================+==========+
| simple      | :class:`asreview.models.balance.SimpleBalance`          |          |
+-------------+---------------------------------------------------------+----------+
| double      | :class:`asreview.models.balance.DoubleBalance`          |          |
+-------------+---------------------------------------------------------+----------+
| undersample | :class:`asreview.models.balance.UndersampleBalance`     |          |
+-------------+---------------------------------------------------------+----------+




