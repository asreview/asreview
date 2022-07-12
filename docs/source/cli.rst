Command Line
============

ASReview provides a powerful command line interface for running tasks like
simulations. For a list of available commands, type :code:`asreview --help`.

LAB
---

:program:`asreview lab` launches the ASReview LAB software (the webapp) and
the following options are available:

.. code:: bash

	asreview lab [options]

.. program:: asreview lab

.. option:: --ip IP

    The IP address the server will listen on.

.. option:: --port PORT

	The port the server will listen on.

.. option:: --port-retries NUMBER_RETRIES

	The number of additional ports to try if the specified port is not
        available.

.. option:: --no-browser NO_BROWSER

	Do not open ASReview LAB in a browser after startup.

.. option:: --certfile CERTFILE_FULL_PATH

    The full path to an SSL/TLS certificate file.

.. option:: --keyfile KEYFILE_FULL_PATH

    The full path to a private key file for usage with SSL/TLS.

.. option:: --embedding EMBEDDING_FP

    File path of embedding matrix. Required for LSTM models.

.. option:: --clean-project CLEAN_PROJECT

    Safe cleanup of temporary files in project.

.. option:: --clean-all-projects CLEAN_ALL_PROJECTS

    Safe cleanup of temporary files in all projects.

.. option:: --seed SEED

	Seed for the model (classifiers, balance strategies, feature extraction
	techniques, and query strategies). Use an integer between 0 and 2^32 - 1.

.. option:: -h, --help

	Show help message and exit.

Simulate
--------

:program:`asreview simulate` measures the performance of the software on
existing systematic reviews. The following options are available:

.. code:: bash

    asreview simulate [options] [dataset [dataset ...]]


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

Algorithms
----------

