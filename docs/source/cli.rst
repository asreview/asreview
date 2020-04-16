Command Line Interface (CLI)
============================

There are two modes: oracle (review) and simulation (benchmark) mode.

Simulation mode
---------------

The CLI for the ASR software in simulation modus is similar to the CLI of the
oracle modus. Instead of ``asreview oracle``, use ``asreview simulate``.

.. code-block:: bash

	asreview simulate YOUR_DATA.csv


The available parameters are: 

.. code-block:: bash

	usage: asreview simulate [-h] [-m MODEL] [-q QUERY_STRATEGY]
	                         [-b BALANCE_STRATEGY] [--n_instances N_INSTANCES]
	                         [--n_queries N_QUERIES] [-n N_PAPERS]
	                         [--embedding EMBEDDING_FP]
	                         [--config_file CONFIG_FILE]
	                         [--prior_included [PRIOR_INCLUDED [PRIOR_INCLUDED ...]]]
	                         [--prior_excluded [PRIOR_EXCLUDED [PRIOR_EXCLUDED ...]]]
	                         [--n_prior_included N_PRIOR_INCLUDED]
	                         [--n_prior_excluded N_PRIOR_EXCLUDED]
	                         [--state_file STATE_FILE] [--save_model SAVE_MODEL_FP]
	                         [--verbose VERBOSE]
	                         X
	
	Automated Systematic Review (ASReview) for simulation runs.
	
	The simulation modus is used to measure the performance of our
	software on existing systematic reviews. The software shows how many
	papers you could have potentially skipped during the systematic
	review.
	
	positional arguments:
	  X                     File path to the dataset or one of the built-in datasets.
	
	optional arguments:
	  -h, --help            show this help message and exit
	  -m MODEL, --model MODEL
	                        The prediction model for Active Learning. Default 'nb'.
	  -q QUERY_STRATEGY, --query_strategy QUERY_STRATEGY
	                        The query strategy for Active Learning. Default 'rand_max'.
	  -b BALANCE_STRATEGY, --balance_strategy BALANCE_STRATEGY
	                        Data rebalancing strategy mainly for RNN methods. Helps against imbalanced dataset with few inclusions and many exclusions. Default 'triple_balance'
	  --n_instances N_INSTANCES
	                        Number of papers queried each query.Default 1.
	  --n_queries N_QUERIES
	                        The number of queries. By default, the program stops after all documents are reviewed or is interrupted by the user.
	  -n N_PAPERS, --n_papers N_PAPERS
	                        The number of papers to be reviewed. By default, the program stops after all documents are reviewed or is interrupted by the user.
	  --embedding EMBEDDING_FP
	                        File path of embedding matrix. Required for LSTM models.
	  --config_file CONFIG_FILE
	                        Configuration file with model parameters
	  --prior_included [PRIOR_INCLUDED [PRIOR_INCLUDED ...]]
	                        A list of included papers.
	  --prior_excluded [PRIOR_EXCLUDED [PRIOR_EXCLUDED ...]]
	                        A list of excluded papers. Optional.
	  --n_prior_included N_PRIOR_INCLUDED
	                        Sample n prior included papers. Only used when --prior_included is not given. Default 10
	  --n_prior_excluded N_PRIOR_EXCLUDED
	                        Sample n prior excluded papers. Only used when --prior_excluded is not given. Default 10
	  --state_file STATE_FILE, -s STATE_FILE
	                        Location to store the state of the review.
	  --save_model SAVE_MODEL_FP
	                        Location to store the model and weights. Only works for Keras/RNN models. End file extension with '.json'.
	  --verbose VERBOSE, -v VERBOSE
	                        Verbosity

