Overview
========

What is a simulation?
---------------------



Why run a simulation?
---------------------

Doing simulations can be a great way to assess how well ASReview performs for
your particular purposes. The user can run simulations on previously fully labeled
datasets to see how much time is saved by using ASReview.

Datasets for simulation
-----------------------

Simulations require :ref:`fully labeled datasets <intro/data_labeled:fully labeled data>`. Such a dataset can be the result of an earlier study. ASReview offers also fully labeled datasets via the `benchmark platform <https://github.com/asreview/systematic-review-datasets>`_. These datasets are available in the webapp in the Data step and in the command line with the prefix `benchmark:` (e.g. `benchmark:van_de_schoot_2017`).


Simulating with ASReview LAB
----------------------------

ASReview LAB offers three different solutions to run simulations:

- With the :ref:`webapp (the frontend) <simulation_overview:simulate with webapp>`
- With the :doc:`command line interface <simulation_cli>`
- With the :doc:`Python API <simulation_api_example>`

Simulate with webapp
--------------------

To run a simulation in the ASReview webapp, create a project as described in
:doc:`lab/launch`. Most of the steps of the setup are identical or
straightworward. In this section, some of the differences are highlighted.

In the step on *Project Information*, select the "Simulation"
mode (see figure below).

.. figure:: ../images/setup_project_info_simulate.png
   :alt: ASReview LAB simulate option

In the step *Data*, import a :ref:`fully labeled dataset <intro/data_labeled:fully labeled data>`
or use one of the benchmark datasets.

.. figure:: ../images/setup_datasets_simulate_benchmark.png
   :alt: ASReview LAB benchmark datasets

Selecting prior knowledge is relatively easy. In case you know relevant
records to start with, use the search function. In case you don't, use the
*Random* option. Toggle the button "Relevant" on top to see some random
irrelevant records. Label some relevant and some irrelevant records.

.. figure:: ../images/setup_datasets_simulate_benchmark.png
   :alt: ASReview LAB benchmark datasets

The step *Warm up* is differs slightly from the Oracle and Exploration mode.
This step start the simulation, after some seconds, it will return "Got it".
This means, the simulation runs further in the background. You are returned to
the Analytics page.

.. figure:: ../images/setup_warmup_simulate_background.png
   :alt: ASReview LAB simulation runs in background

This page now has a refresh button on the top right. If
the simulation is not finished yet, you can refresh the page or use the
refresh button to follow the progress. After a while, the Elas mascotte on the
left will hold a sign finished. Your simulation is now finished and you can
study the results in the analytics page.


Analyzing results
-----------------

After a simulation, the results are stored in the ASReview project file
(extension `.asreview`). This file contains a large number of variables and
logs on the simulation. The data can be extracted from the project file via the API or with one of the available extensions. See :doc:`these examples on the Project API <API/example_api_asreview_file>` for more information about opening the project file. An easier solution would be to use one of the extensions. ASReview Insights is a useful example.

The extension `ASReview Insights <https://github.com/asreview/asreview-insights>`_ offers useful tools, like plotting functions and metrics, to analyze results of a simulation.

Install ASReview Insights directly from PyPi:

.. code-block:: bash

	pip install asreview-insights

Detailed documention can found on the `ASReview Insights GitHub <https://github.com/asreview/asreview-insights>`_ page.

The following command returns the recall at any moment during the simulation:

.. code-block:: bash

	asreview plot recall MY_SIMULATION.asreview

