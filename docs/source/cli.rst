Command Line Interface (CLI)
============================

Basic usage:

.. code-block:: bash

	asreview simulate YOUR_DATA.csv --state_file myreview.h5


The available parameters are:

.. code-block:: bash

    $ asreview simulate -h
    usage: simulate [-h] [--embedding EMBEDDING_FP] [--config_file CONFIG_FILE] [--seed SEED] [--n_prior_included N_PRIOR_INCLUDED]
                    [--n_prior_excluded N_PRIOR_EXCLUDED] [--prior_idx [PRIOR_IDX [PRIOR_IDX ...]]] [--included_dataset [INCLUDED_DATASET [INCLUDED_DATASET ...]]]
                    [--excluded_dataset [EXCLUDED_DATASET [EXCLUDED_DATASET ...]]] [--prior_dataset [PRIOR_DATASET [PRIOR_DATASET ...]]] [--state_file STATE_FILE]
                    [-m MODEL] [-q QUERY_STRATEGY] [-b BALANCE_STRATEGY] [-e FEATURE_EXTRACTION] [--init_seed INIT_SEED] [--n_instances N_INSTANCES]
                    [--n_queries N_QUERIES] [-n N_PAPERS] [--abstract_only] [--verbose VERBOSE]
                    [dataset [dataset ...]]

    ASReview for simulation.

    The simulation modus is used to measure the performance of our
    software on existing systematic reviews. The software shows how many
    papers you could have potentially skipped during the systematic
    review.

    positional arguments:
      dataset               File path to the dataset or one of the built-in datasets.

    optional arguments:
      -h, --help            show this help message and exit
      --embedding EMBEDDING_FP
                            File path of embedding matrix. Required for LSTM models.
      --config_file CONFIG_FILE
                            Configuration file with model settingsand parameter values.
      --seed SEED           Seed for the model (classifiers, balance strategies, feature extraction techniques, and query strategies). Use an integer between 0 and 2^32 - 1.
      --n_prior_included N_PRIOR_INCLUDED
                            Sample n prior included papers. Only used when --prior_included is not given. Default 1
      --n_prior_excluded N_PRIOR_EXCLUDED
                            Sample n prior excluded papers. Only used when --prior_excluded is not given. Default 1
      --prior_idx [PRIOR_IDX [PRIOR_IDX ...]]
                            Prior indices by rownumber (0 is first rownumber).
      --included_dataset [INCLUDED_DATASET [INCLUDED_DATASET ...]]
                            A dataset with papers that should be includedCan be used multiple times.
      --excluded_dataset [EXCLUDED_DATASET [EXCLUDED_DATASET ...]]
                            A dataset with papers that should be excludedCan be used multiple times.
      --prior_dataset [PRIOR_DATASET [PRIOR_DATASET ...]]
                            A dataset with papers from prior studies.
      --state_file STATE_FILE, -s STATE_FILE, --log_file STATE_FILE, -l STATE_FILE
                            Location to store the state of the simulation.
      -m MODEL, --model MODEL
                            The prediction model for Active Learning. Default: 'nb'.
      -q QUERY_STRATEGY, --query_strategy QUERY_STRATEGY
                            The query strategy for Active Learning. Default: 'max'.
      -b BALANCE_STRATEGY, --balance_strategy BALANCE_STRATEGY
                            Data rebalancing strategy mainly for RNN methods. Helps against imbalanced dataset with few inclusions and many exclusions. Default: 'double'
      -e FEATURE_EXTRACTION, --feature_extraction FEATURE_EXTRACTION
                            Feature extraction method. Some combinations of feature extraction method and prediction model are impossible/ill advised.Default: 'tfidf'
      --init_seed INIT_SEED
                            Seed for setting the prior indices if the --prior_idx option is not used. If the option --prior_idx is used with one or more index, this option is ignored.
      --n_instances N_INSTANCES
                            Number of papers queried each query.Default 1.
      --n_queries N_QUERIES
                            The number of queries. By default, the program stops after all documents are reviewed or is interrupted by the user.
      -n N_PAPERS, --n_papers N_PAPERS
                            The number of papers to be reviewed. By default, the program stops after all documents are reviewed or is interrupted by the user.
      --abstract_only       Simulate using the labels of abstract screening. This is option is useful if there is both a column for abstract and final screening available in the dataset. Default False.
      --verbose VERBOSE, -v VERBOSE
                            Verbosity
