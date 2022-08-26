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
simulate. The result of the simulation is stored, after a successful
simulation, at ``MY_SIMULATION.asreview`` where ``MY_SIMULATION`` is the
filename you prefer.

.. note::

	For instructions on preparing your fully labeled data, see :doc:`data`.

Simulation options
------------------

ASReview LAB provides an extensive simulation interface via the command line.
An overview of the options are found on the :ref:`ASReview command line
interface for simulation <cli:Simulate>` page. This section highlights
some of the most used options. When no additional arguments are specified in
the ``asreview simulate`` command, default settings are used.

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

- You can select a classifier with the ``-m`` flag, which is set to be Naive
  Bayes by default. Names for implemented classifiers are listed on the
  :ref:`classifiers-table` table.

- Implemented query strategies are listed on the :ref:`query-strategies-table`
  table and can be set with the ``-q`` option.

- For feature extraction, supply the ``-e`` flag. Default is TF-IDF, more
  details on the table for :ref:`feature-extraction-table`.

- The last element that can be changed is the :ref:`balance-strategies-table`,
  and is changed with the ``-b`` flag. Default is double balance.
