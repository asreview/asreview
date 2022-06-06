Simulation via command line
===========================

At the moment, the ASReview simulation mode is only available in the command
line interface. When using the :ref:`ASReview command line interface for
simulation <API/cli:Simulate>`, a fully labeled dataset is required (labeling
decisions: ``0`` = irrelevant, ``1`` = relevant).

See the following resources for  information on running a simulation:

- :ref:`ASReview command line interface for simulation <API/cli:Simulate>`
- :doc:`../guides/simulation_study_results`
- :doc:`../guides/sim_overview`


.. warning::

    If you upload your own data, make sure to remove duplicates and to retrieve
    as many abstracts as possible (`don't know how?
    <https://asreview.nl/blog/the-importance-of-abstracts/>`_). With clean data you
    benefit most from what :doc:`active learning <../guides/activelearning>`
    has to offer.


Doing the simulation
--------------------

The ASReview simulation mode iterates through the dataset exactly like an
ASReview user would, using the inclusions and exclusions as included in the dataset to
learn in the active learning cycle. In this way, the entire screening process
is replicated.

You can use the simulation mode that is provided with the ASReview package. It
can be accessed directly from the command line, for example like:

.. code-block:: bash

	asreview simulate MY_DATASET.csv --state_file myreview.asreview

This performs a simulation of a default active learning model, where
``MY_DATASET.csv`` is the path to the fully labeled dataset you wish to simulate on
and where ``myreview.asreview`` is the file wherein the results will be stored.


More details on specific model and simulation settings can be found in the
Simulation options section below. For how to prepare your data, see
:doc:`../intro/datasets`.



Simulation options
------------------

ASReview provides an extensive simulation interface via the command line. An
overview of the options are found on the :ref:`ASReview command line interface
for simulation <API/cli:Simulate>` page. This section highlights some of the more
often used options here. When no additional arguments are specified in the
``asreview simulate`` command, default settings are used.

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
labeled before the model is retrained, and is set at 1 by default. If
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
