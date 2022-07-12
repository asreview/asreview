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
An overview of the options are found on the :ref:`ASReview command line
interface for simulation <cli:Simulate>` page. This section highlights
some of the most used options. When no additional arguments are specified in
the ``asreview simulate`` command, default settings are used.


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




