Simulate a review
=================

Simulations in ASReview LAB provide a controlled environment to test hypotheses,
refine strategies, and gain insights into model performance. By leveraging fully
labeled datasets, the software mimics how a human would label records in
interaction with the Active Learning model. If you're unsure which model to use
for a new (unlabeled) dataset, simulations can help identify the best-performing
combination of model components.

ASReview LAB offers three versatile methods to run simulations:

- :ref:`Simulate with ASReview LAB <lab/simulation_overview:Simulate with ASReview LAB>`
- :doc:`Command line interface <simulation_cli>`
- :doc:`Python API <simulation_api_example>`

Simulating with ASReview LAB allows you to evaluate model performance using
various metrics and estimate workload reduction achieved through active learning
compared to manual screening.

Additionally, simulation mode enables benchmarking your custom models against
existing ones across diverse datasets. ASReview LAB supports extending its
capabilities by adding new models `via a template
<https://github.com/asreview/template-extension-new-model>`_.

Datasets for simulation
-----------------------

Simulations require :ref:`fully labeled datasets <lab/data_labeled:fully labeled
data>` (labels: ``0`` = irrelevant, ``1`` = relevant). Such a dataset can be the
result of an earlier study. ASReview also provides fully labeled datasets via the
`SYNERGY dataset <https://github.com/asreview/synergy-dataset>`_. These datasets
are available via the user interface in the *Data* step of the setup and in the
command line with the prefix `synergy:` (e.g., `synergy:van_de_schoot_2018`).

.. tip::

    When importing your data, ensure duplicates are removed and as many abstracts
    as possible are retrieved (`See Importance-of-abstracts blog for help
    <https://asreview.ai/blog/the-importance-of-abstracts/>`_). Clean data allows
    you to fully benefit from what :doc:`active learning <about>` has to offer.

Simulate with ASReview LAB
--------------------------

To run a simulation in the ASReview LAB, go to Simulations, create a project in
the same way as described in :doc:`project_create`. Most of the steps of the
setup are identical or straightforward. Make sure you import a :ref:`fully
labeled dataset <lab/data_labeled:fully labeled data>` or use one of the
benchmark datasets.

Selecting prior knowledge is straightforward. In case you know relevant records
to start with, use the search function. In case you don't, the simulation will
start with random screening.

Click on Simulate to start the simulation. The simulation will run in the
background. You can follow the progress on the projects overview page. Once the
simulation is finished, the project can be opened to analyze or the results.


Insights into simulation results
--------------------------------

After a simulation, the results can be exported to an ASReview project file
(extension `.asreview`). This file contains a wealth of variables and logs
related to the simulation. The data can be extracted from the project file via
the API or with one of the available extensions. See :doc:`these examples on the
Project API <../technical/example_api_asreview_file>` for more information about
accessing the project file.

One readily available extension for analyzing simulation results is
`ASReview Insights <https://github.com/asreview/asreview-insights>`_. This
extension provides tools for plotting recall and extracting statistical results
for several performance metrics, such as Loss, Work Saved over Sampling (WSS),
the proportion of Relevant Records Found (RRF), Extra Relevant Records Found
(ERF), and Average Time to Discover (ATD).

Install ASReview Insights directly from PyPi:

.. code-block:: bash

	pip install asreview-insights

Detailed documentation on the extension can be found on the `ASReview Insights
<https://github.com/asreview/asreview-insights>`_ project page.
