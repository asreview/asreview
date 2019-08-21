Command Line Interface (CLI)
============================

There are two modes: oracle (review) and simulation (benchmark) mode.


Oracle mode
-----------

Start a review process in the CMD.exe or shell. 


.. code-block:: bash

	asreview oracle YOUR_DATA.csv


The available parameters are shown with the command ``asreview oracle --help``: 

.. code-block:: bash

	usage: asreview oracle [-h] [-m MODEL] [-q QUERY_STRATEGY]
	                  [--n_instances N_INSTANCES] [--n_queries N_QUERIES]
	                  [--embedding EMBEDDING_FP] [--config_file CONFIG_FILE]
	                  [--prior_included [PRIOR_INCLUDED [PRIOR_INCLUDED ...]]]
	                  [--prior_excluded [PRIOR_EXCLUDED [PRIOR_EXCLUDED ...]]]
	                  [--log_file LOG_FILE] [--save_model SAVE_MODEL]
	                  [--verbose VERBOSE]
	                  X
	
	Systematic review with the help of an oracle.
	
	positional arguments:
	  X                     File path to the dataset. The dataset needs to be in
	                        the standardised format.
	
	optional arguments:
	  -h, --help            show this help message and exit
	  -m MODEL, --model MODEL
	                        The prediction model for Active Learning. Default
	                        'LSTM'.
	  -q QUERY_STRATEGY, --query_strategy QUERY_STRATEGY
	                        The query strategy for Active Learning. Default
	                        'uncertainty'.
	  --n_instances N_INSTANCES
	                        Number of papers queried each query.
	  --n_queries N_QUERIES
	                        The number of queries. Default None
	  --embedding EMBEDDING_FP
	                        File path of embedding matrix. Required for LSTM
	                        model.
	  --config_file CONFIG_FILE
	                        Configuration file with model parameters
	  --prior_included [PRIOR_INCLUDED [PRIOR_INCLUDED ...]]
	                        Initial included papers.
	  --prior_excluded [PRIOR_EXCLUDED [PRIOR_EXCLUDED ...]]
	                        Initial included papers.
	  --log_file LOG_FILE, -l LOG_FILE
	                        Location to store the log results.
	  --save_model SAVE_MODEL
	                        Location to store the model.
	  --verbose VERBOSE, -v VERBOSE
	                        Verbosity

Simulation mode
---------------

The CLI for the ASR software in simulation modus is similar to the CLI of the
oracle modus. Instead of ``asreview oracle``, use ``asreview simulate``.

.. code-block:: bash

	asreview simulate YOUR_DATA.csv


The available parameters are: 

.. code-block:: bash

	usage: asreview simulate [-h] [-m MODEL] [-q QUERY_STRATEGY]
	                    [--n_instances N_INSTANCES] [--n_queries N_QUERIES]
	                    [--embedding EMBEDDING_FP] [--config_file CONFIG_FILE]
	                    [--prior_included [PRIOR_INCLUDED [PRIOR_INCLUDED ...]]]
	                    [--prior_excluded [PRIOR_EXCLUDED [PRIOR_EXCLUDED ...]]]
	                    [--n_prior_included [N_PRIOR_INCLUDED [N_PRIOR_INCLUDED ...]]]
	                    [--n_prior_excluded [N_PRIOR_EXCLUDED [N_PRIOR_EXCLUDED ...]]]
	                    [--log_file LOG_FILE] [--save_model SAVE_MODEL]
	                    [--verbose VERBOSE]
	                    X
	
	Systematic review with the help of an oracle.
	
	positional arguments:
	  X                     File path to the dataset. The dataset needs to be in
	                        the standardised format.
	
	optional arguments:
	  -h, --help            show this help message and exit
	  -m MODEL, --model MODEL
	                        The prediction model for Active Learning. Default
	                        'LSTM'.
	  -q QUERY_STRATEGY, --query_strategy QUERY_STRATEGY
	                        The query strategy for Active Learning. Default
	                        'uncertainty'.
	  --n_instances N_INSTANCES
	                        Number of papers queried each query.
	  --n_queries N_QUERIES
	                        The number of queries. Default None
	  --embedding EMBEDDING_FP
	                        File path of embedding matrix. Required for LSTM
	                        model.
	  --config_file CONFIG_FILE
	                        Configuration file with model parameters
	  --prior_included [PRIOR_INCLUDED [PRIOR_INCLUDED ...]]
	                        Initial included papers.
	  --prior_excluded [PRIOR_EXCLUDED [PRIOR_EXCLUDED ...]]
	                        Initial included papers.
	  --n_prior_included [N_PRIOR_INCLUDED [N_PRIOR_INCLUDED ...]]
	                        Sample n prior included papers. Only used when
	                        --prior_included is not given.
	  --n_prior_excluded [N_PRIOR_EXCLUDED [N_PRIOR_EXCLUDED ...]]
	                        Sample n prior excluded papers. Only used when
	                        --prior_excluded is not given.
	  --log_file LOG_FILE, -l LOG_FILE
	                        Location to store the log results.
	  --save_model SAVE_MODEL
	                        Location to store the model.
	  --verbose VERBOSE, -v VERBOSE
	                        Verbosity

