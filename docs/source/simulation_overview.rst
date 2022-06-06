Overview
========

Why run a simulation?
---------------------

Doing simulations can be a great way to assess how well ASReview performs for
your particular purposes. The user can run simulations on previously fully labeled
datasets to see how much time is saved by using ASReview.



For an example of the results of a simulation study, see
:doc:`simulation_study_results`.

Simulating with ASReview
------------------------

ASReview LAB offers three different solutions to run simulations:

- With the webapp (the frontend)
- With the :doc:`command line interface <simulation_cli>`
- With the :doc:`Python API <simulation_api_example>`

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

