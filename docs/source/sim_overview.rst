Simulation
==========

.. role:: strike

Why run a simulation?
---------------------

Doing simulations can be a great way to assess how well ASReview performs for
your particular purposes. The user can run simulations on previously labelled
datasets to see how much time the user could have saved using ASReview.

Doing the simulation
--------------------

The ASReview simulation mode works through the dataset exactly like an
ASReview user would, using the inclusions and exclusions in the dataset to
learn in the active learning cycle. In this way, the entire screening process
is replicated.

You can use the simulation mode that is provided with the ASReview package. It
can be accessed directly from the command line, for example:

.. code-block:: bash

	asreview simulate MY_DATASET.csv --state_file myreview.h5

This performs a simulation of a default active learning model, where
``MY_DATASET.csv`` is the path to the dataset you wish to simulate on and
where ``myreview.h5`` is the file where the results will be stored.


More detail on specific model and simulation settings can be found in the
Simulation options section. For how to prepare your data, see the `dataset
<datasets.html>`__ page.



Analyzing your results
----------------------

The extensions `asreview-statistics <https://github.com/asreview/asreview-
statistics>`_ and `asreview-visualization <https://github.com/asreview
/asreview-visualization>`_ are useful tools to analyze results. Install them
directly from PyPi:

.. code-block:: bash

	pip install asreview-statistics asreview-visualization

Detailed information can be found on their respective GitHub pages. The
following commands should give you at least a basic exploratory idea of the
performance of your review:

.. code-block:: bash

	asreview stat YOUR_DATASET.csv
	asreview stat myreview.h5
	asreview stat DIR_WITH_MULTIPLE_SIMULATIONS

	asreview plot myreview.h5
	asreview plot DIR_WITH_MULTIPLE_SIMULATIONS

For an example of results of a simulation study, see the `Simulation Results
<simulation-results.html>`__ page.


Simulation options
------------------

The options for simulating are shown on
the `CLI <cli.html>`__ page. We will highlight some of the more often used
options here. When no additional arguments are specified in the ``asreview
simulate`` command, default settings are used.

To make your simulations reproducible you can use the ``--seed`` and
``--init_seed`` options. 'init_seed' controls the starting set of papers to
train the model on, while the 'seed' controls the seed of the random number
generation that is used after initialization.

By default, the model initializes with one relevant and one irrelevant record.
You can set the number of priors by `--n_prior_included` and
`--n_prior_excluded`. However, if you want to initialize your model with a
specific set of starting papers, you can use ``--prior_idx`` to select the
indices of the papers you want to start the simulation with.

The ``--n_instances`` argument controls the number of records that have to be
labelled before the model is retrained again and is set at 1 by default. If
you want to reduce the number of training iterations, for example to limit the
size of your state file and the time to simulate, you can increase
``--n_instances``.

You can select a classifier with the ``-m`` flag, which is set to be Naive
Bayes by default. Names for implemented classifiers are listed on the :ref
:`classifiers-table` table.

Implemented query strategies are listed on the :ref:`query-strategies-table`
table and can be set with the ``-q`` option.

For feature extraction, supply the ``-e`` flag. Default is TF-IDF, more
details on the table for :ref:`feature-extraction-table`.

The last element that can be changed is the :ref:`balance-strategies-table`,
and is changed with the ``-b`` flag. Default is double balance.

