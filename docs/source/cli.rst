Command Line
============

ASReview provides a powerful command line interface for running tasks like
simulations. For a list of available commands, type :code:`asreview --help`.

lab
---

:program:`asreview lab` launches the ASReview LAB software (the frontend).

.. code:: bash

	asreview lab [options]

.. program:: asreview lab

.. option:: --ip IP

    The IP address the server will listen on.

.. option:: --port PORT

	The port the server will listen on.

.. option:: --embedding EMBEDDING_FP

    File path of embedding matrix. Required for LSTM models.

.. option:: --seed SEED

	Seed for the model (classifiers, balance strategies, feature extraction
	techniques, and query strategies). Use an integer between 0 and 2^32 - 1.

.. option:: -h, --help

	Show help message and exit.

simulate
--------

:program:`asreview simulate` measures the performance of the software on
existing systematic reviews. The software shows how many papers you could have
potentially skipped during the systematic review.

.. code:: bash

	asreview simulate [options] [dataset [dataset ...]]

Example:

.. code:: bash

	asreview simulate YOUR_DATA.csv --state_file myreview.h5


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

    Configuration file with model settingsand parameter values.

.. option:: --seed SEED

	Seed for the model (classifiers, balance strategies, feature extraction
	techniques, and query strategies). Use an integer between 0 and 2^32 - 1.

.. option:: --n_prior_included N_PRIOR_INCLUDED

    The number of prior included papers. Only used when :code:`prior_idx` is not given. Default 1.

.. option:: --n_prior_excluded N_PRIOR_EXCLUDED

    The number of prior excluded papers. Only used when :code:`prior_idx` is not given. Default 1.

.. option:: --prior_idx [PRIOR_IDX [PRIOR_IDX ...]]

    Prior indices by rownumber (0 is first rownumber).

.. option:: --included_dataset [INCLUDED_DATASET [INCLUDED_DATASET ...]]

    A dataset with papers that should be includedCan be used multiple times.

.. option:: --excluded_dataset [EXCLUDED_DATASET [EXCLUDED_DATASET ...]]

    A dataset with papers that should be excludedCan be used multiple times.

.. option:: --prior_dataset [PRIOR_DATASET [PRIOR_DATASET ...]]

    A dataset with papers from prior studies.

.. option:: --state_file STATE_FILE, -s STATE_FILE

    Location to store the (active learning) state of the simulation. It is
    possible to output the state to a JSON file (extension :code:`.json`) or
    `HDF5 file <https://en.wikipedia.org/wiki/Hierarchical_Data_Format>`__
    (extension :code:`.h5`).

.. option:: --init_seed INIT_SEED

    Seed for setting the prior indices if the prior_idx option is not used. If the option
    prior_idx is used with one or more index, this option is ignored.

.. option:: --n_instances N_INSTANCES

    Number of papers queried each query.Default 1.

.. option:: --n_queries N_QUERIES

    The number of queries. By default, the program stops after all documents are reviewed
    or is interrupted by the user.

.. option:: -n N_PAPERS, --n_papers N_PAPERS

    The number of papers to be reviewed. By default, the program stops after
    all documents  are reviewed or is interrupted by the user.

.. option:: --abstract_only

	Simulate using the labels of abstract screening. This is option is useful
	if  there is both a column for abstract and final screening available in
	the dataset. Default False.

.. option:: --verbose VERBOSE, -v VERBOSE

    Verbosity

.. option:: -h, --help

	Show help message and exit.


.. note::

	Some classifiers (models) and feature extraction algorithms require additional dependecies. Use :code:`pip install asreview[all]` to install all additional dependencies at once.


.. _feature-extraction-table:

Feature extraction
~~~~~~~~~~~~~~~~~~

+----------------+----------------------------------------------------+-----------------------------------------------------------------------------+
| Name           | Reference                                          | Requires                                                                    |
+================+====================================================+=============================================================================+
| tfidf          | :class:`asreview.feature_extraction.Tfidf`         |                                                                             |
+----------------+----------------------------------------------------+-----------------------------------------------------------------------------+
| doc2vec        | :class:`asreview.feature_extraction.Doc2Vec`       | `gensim <https://radimrehurek.com/gensim/>`__                               |
+----------------+----------------------------------------------------+-----------------------------------------------------------------------------+
| embedding-idf  | :class:`asreview.feature_extraction.EmbeddingIdf`  |                                                                             |
+----------------+----------------------------------------------------+-----------------------------------------------------------------------------+
| embedding-lstm | :class:`asreview.feature_extraction.EmbeddingLSTM` |                                                                             |
+----------------+----------------------------------------------------+-----------------------------------------------------------------------------+
| sbert          | :class:`asreview.feature_extraction.SBERT`         | `sentence_transformers <https://github.com/UKPLab/sentence-transformers>`__ |
+----------------+----------------------------------------------------+-----------------------------------------------------------------------------+

.. _classifiers-table:

Classifiers
~~~~~~~~~~~

+-------------+---------------------------------------------------------+-----------------------------------------------+
| Name        | Reference                                               | Requires                                      |
+=============+=========================================================+===============================================+
| nb          | :class:`asreview.models.NBModel`                        |                                               |
+-------------+---------------------------------------------------------+-----------------------------------------------+
| svm         | :class:`asreview.models.SVMModel`                       |                                               |
+-------------+---------------------------------------------------------+-----------------------------------------------+
| logistic    | :class:`asreview.models.LogisticModel`                  |                                               |
+-------------+---------------------------------------------------------+-----------------------------------------------+
| rf          | :class:`asreview.models.RFModel`                        |                                               |
+-------------+---------------------------------------------------------+-----------------------------------------------+
| nn-2-layer  | :class:`asreview.models.NN2LayerModel`                  |  `tensorflow <https://www.tensorflow.org/>`__ |
+-------------+---------------------------------------------------------+-----------------------------------------------+
| lstm-base   | :class:`asreview.models.LSTMBaseModel`                  |  `tensorflow <https://www.tensorflow.org/>`__ |
+-------------+---------------------------------------------------------+-----------------------------------------------+
| lstm-pool   | :class:`asreview.models.LSTMPoolModel`                  |  `tensorflow <https://www.tensorflow.org/>`__ |
+-------------+---------------------------------------------------------+-----------------------------------------------+

.. _query-strategies-table:

Query strategies
~~~~~~~~~~~~~~~~

+-------------+---------------------------------------------------------+--------------+
| Name        | Reference                                               | Requires     |
+=============+=========================================================+==============+
| max         | :class:`asreview.query_strategies.MaxQuery`             |              |
+-------------+---------------------------------------------------------+--------------+
| random      | :class:`asreview.query_strategies.RandomQuery`          |              |
+-------------+---------------------------------------------------------+--------------+
| uncertainty | :class:`asreview.query_strategies.UncertaintyQuery`     |              |
+-------------+---------------------------------------------------------+--------------+
| cluster     | :class:`asreview.query_strategies.ClusterQuery`         |              |
+-------------+---------------------------------------------------------+--------------+

.. _balance-strategies-table:

Balance strategies
~~~~~~~~~~~~~~~~~~

+-------------+---------------------------------------------------------+----------+
| Name        | Reference                                               | Requires |
+=============+=========================================================+==========+
| simple      | :class:`asreview.balance_strategies.SimpleBalance`      |          |
+-------------+---------------------------------------------------------+----------+
| double      | :class:`asreview.balance_strategies.DoubleBalance`      |          |
+-------------+---------------------------------------------------------+----------+
| triple      | :class:`asreview.balance_strategies.TripleBalance`      |          |
+-------------+---------------------------------------------------------+----------+
| undersample | :class:`asreview.balance_strategies.UndersampleBalance` |          |
+-------------+---------------------------------------------------------+----------+


simulate-batch
--------------

:program:`asreview simulate-batch` provides the same interface as the
:program:`asreview simulate`, but adds an extra option (:code:`--n_runs`) to run a
batch of simulation runs with the same configuration.

.. code:: bash

	asreview simulate-batch [options] [dataset [dataset ...]]

.. warning::

	The behavour of some arguments of :program:`asreview simulate-batch` will differ
	slightly from :program:`asreview simulate`.

.. program:: asreview simulate-batch

.. option:: dataset

    A dataset to simulate

.. option:: --n_runs

    Number of simulation runs.


algorithms
----------

.. versionadded:: 0.14

:program:`asreview algorithms` provides an overview of all available active
learning model elements (classifiers, query strategies, balance
strategies, and feature extraction algorithms) in ASReview.

.. code:: bash

    asreview algorithms

.. note::

    :program:`asreview algorithms` lists models added via extensions as well.
    See :ref:`develop-extensions` for more information on creating an model
    extension.
