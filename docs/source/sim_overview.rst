Overview
========


Doing the simulation
--------------------

Doing simulations can be a great way to assess how well *ASReview* performs for your particular
needs.
There are a few ways to perform simulations with the ASReview. For how to prepare your data,
see the `dataset <datasets.html>`__ page.

The first option is to use the simulation mode that is provided with the _ASReview_ package. It can
be accessed directly from the command line, for example:

.. code-block:: bash

	asreview simulate YOUR_DATASET.csv --state_file myreview.h5 --n_instances 1 -m nb

This performs a simulation retraining the model after reviewing each record with the Naive Bayes
model, and storing the results in the file ``myreview.h5``. More detail can be found in the section
on the `cli simulation <cli.html>`__ page.

A second option is to use the functionality of the 
`asreview-simulation <https://github.com/asreview/automated-systematic-review-simulations>`_
package. It makes it easier to run multiple simulations at the same time in case that we have
more cores/processors available. Notice that it requires a library that implements the MPI standard,
such as OpenMPI.

Another option is to use the *ASReview* `API <api.html>`__ directly. The advantage is that you'll
have more control over the flow of the simulation, but you will need to program some code in python.


Analyzing your results
----------------------

While you can analyze the results with our API, specifically with the
:class:`asreview.analysis.Analysis` class, the easier way is to use the
`asreview-statistics <https://github.com/asreview/asreview-statistics>`_ and 
`asreview-visualization <https://github.com/asreview/asreview-visualization>`_ plugins. You can
install them directly from PyPi:

.. code-block:: bash

	pip install asreview-statistics asreview-visualization

Detailed information can be found on their respective GitHub pages. The following commands should
give you at least a basic exploratory idea of the performance of your review:

.. code-block:: bash

	asreview stat YOUR_DATASET.csv
	asreview stat myreview.h5
	asreview stat DIR_WITH_MULTIPLE_SIMULATIONS

	asreview plot myreview.h5
	asreview plot DIR_WITH_MULTIPLE_SIMULATIONS

	
Simulation options
------------------
The options for simulating are shown on the `CLI <cli.html>`__ page. We will highlight some of the
more often used options here.

To make your simulations reproducible you can use the ``--seed`` and ``--init_seed`` options. Init
seed controls the starting set of papers to train the model on. While the normal seed controls the
random generator after initialization. For initialization you can also use ``--prior_idx`` to set
the papers to start the simulation with.

To limit the size of your state file and the time to simulate, you can increase ``--n_instances``,
which reduces the number of training iterations.

Use a different classifier with the ``-m`` flag. Names for implemented models are listed on the
`models <models.html>`__ page.

Implemented query strategies are listed on the `query strategy <query_strategies.html>`__ page and
is set with the ``-q`` option.

For feature feature extraction, supply the ``-e`` flag, with more details on the page for 
`feature extraction <feature_extraction.html>`__.

The last model that can be changed is the `balance strategy <balance_strategies.html>`__, and is
changed with the ``-b`` flag.

Finally, options can also be supplied through a configuration file with ``--config_file``.
For example:

.. code-block:: ini

	[global_settings]
	n_instances = 1
	n_prior_included = 0
	n_prior_excluded = 0
	model = nb
	balance_strategy = double
	query_strategy = max
	feature_extraction = tfidf
	
	[balance_param]
	a = 0.7492527339524988
	alpha = 1.376755934059147
	b = 0.15013204593328155
	
	[feature_param]
	ngram_max = 2
	split_ta = 0
	use_keywords = 0
	
	[model_param]
	alpha = 0.8267010267867003
