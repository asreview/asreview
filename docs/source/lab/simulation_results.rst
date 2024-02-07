
Analyzing results
=================

After a simulation, the results are stored in the ASReview project file
(extension `.asreview`). This file contains a large number of variables and
logs on the simulation. The data can be extracted from the project file via
the API or with one of the available extensions. See
:doc:`these examples on the Project API <../technical/example_api_asreview_file>`
for more information about opening the project file.

One readily available extension for analyzing the results of a simulation is
`ASReview Insights <https://github.com/asreview/asreview-insights>`_. This
extension offers valuable tools for plotting the recall and extracting the
statistical results of several performance metrics, such as the Work Saved
over Sampling (WSS), the proportion of Relevant Record Found (RRF), the Extra
Relevant records Found (ERF), and the Average Time to Discover (ATD).

Install ASReview Insights directly from PyPi:

.. code-block:: bash

	pip install asreview-insights

Detailed documentation on the extension can be found on
the `ASReview Insights <https://github.com/asreview/asreview-insights>`_ project page.
