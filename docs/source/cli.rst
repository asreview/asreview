Command Line Interface (CLI)
============================

Basic usage:

.. code-block:: bash

	asreview simulate YOUR_DATA.csv --state_file myreview.h5


The available parameters are: 

.. code-block:: bash

	usage: simulate [-h] [-m MODEL] [-q QUERY_STRATEGY] [-b BALANCE_STRATEGY]
	                [-e FEATURE_EXTRACTION] [--n_instances N_INSTANCES]
	                [--n_queries N_QUERIES] [-n N_PAPERS]
	                [--embedding EMBEDDING_FP] [--config_file CONFIG_FILE]
	                [--included_dataset [INCLUDED_DATASET [INCLUDED_DATASET ...]]]
	                [--excluded_dataset [EXCLUDED_DATASET [EXCLUDED_DATASET ...]]]
	                [--prior_dataset [PRIOR_DATASET [PRIOR_DATASET ...]]]
	                [--state_file STATE_FILE] [--seed SEED] [--abstract_only]
	                [--n_prior_included N_PRIOR_INCLUDED]
	                [--n_prior_excluded N_PRIOR_EXCLUDED]
	                [--prior_idx [PRIOR_IDX [PRIOR_IDX ...]]]
	                [--init_seed INIT_SEED] [--verbose VERBOSE] 
					[--completion_file COMPLETION_FILE]
	                [dataset [dataset ...]]
	
	Automated Systematic Review (ASReview) for simulation runs.
	
	The simulation modus is used to measure the performance of our
	software on existing systematic reviews. The software shows how many
	papers you could have potentially skipped during the systematic
	review.
	
	positional arguments:
	  dataset               File path to the dataset or one of the built-in datasets.
	
	optional arguments:
	  -h, --help            show this help message and exit
	  -m MODEL, --model MODEL
	                        The prediction model for Active Learning. Default: 'nb'.
	  -q QUERY_STRATEGY, --query_strategy QUERY_STRATEGY
	                        The query strategy for Active Learning. Default: 'max_random'.
	  -b BALANCE_STRATEGY, --balance_strategy BALANCE_STRATEGY
	                        Data rebalancing strategy mainly for RNN methods. Helps against imbalanced dataset with few inclusions and many exclusions. Default: 'triple'
	  -e FEATURE_EXTRACTION, --feature_extraction FEATURE_EXTRACTION
	                        Feature extraction method. Some combinations of feature extraction method and prediction model are impossible/ill advised.Default: 'tfidf'
	  --n_instances N_INSTANCES
	                        Number of papers queried each query. Default 1.
	  --n_queries N_QUERIES
	                        The number of queries. By default, the program stops after all documents are reviewed or is interrupted by the user.
	  -n N_PAPERS, --n_papers N_PAPERS
	                        The number of papers to be reviewed. By default, the program stops after all documents are reviewed or is interrupted by the user.
	  --embedding EMBEDDING_FP
	                        File path of embedding matrix. Required for LSTM models.
	  --config_file CONFIG_FILE
	                        Configuration file with model parameters
	  --included_dataset [INCLUDED_DATASET [INCLUDED_DATASET ...]]
	                        A dataset with papers that should be included.
	                        Can be used multiple times.
	  --excluded_dataset [EXCLUDED_DATASET [EXCLUDED_DATASET ...]]
	                        A dataset with papers that should be excluded.
	                        Can be used multiple times.
	  --prior_dataset [PRIOR_DATASET [PRIOR_DATASET ...]]
	                        A dataset with papers from prior studies.
	  --state_file STATE_FILE, -s STATE_FILE, --log_file STATE_FILE, -l STATE_FILE
	                        Location to store the state of the simulation.
	  --seed SEED           Seed for models. Use integer between 0 and 2^32 - 1.
	  --abstract_only       Use after abstract screening as the inclusions/exclusions.
	  --n_prior_included N_PRIOR_INCLUDED
	                        Sample n prior included papers. Only used when --prior_included is not given. Default 1
	  --n_prior_excluded N_PRIOR_EXCLUDED
	                        Sample n prior excluded papers. Only used when --prior_excluded is not given. Default 1
	  --prior_idx [PRIOR_IDX [PRIOR_IDX ...]]
	                        Prior indices by id.
	  --init_seed INIT_SEED
	                        Seed for setting the prior indices if the --prior_idx option is not used. If the option --prior_idx is used with one or more index, this option is ignored.
	  --verbose VERBOSE, -v VERBOSE
	                        Verbosity
	  --completion_file COMPLETION_FILE
	  						A file that is created at the end of a simulation.
