ASReview-visualization
======================

ASReview-visualization is a plotting and visualization supplemental package
for the `ASReview`_ software. It is a fast way to create a visual impression
of the ASReview with different datasets, models and model parameters.

.. _ASReview: https://github.com/asreview/asreview

Installation
------------

The easiest way to install the visualization package is to install from
PyPI:

.. code:: bash

    pip install asreview-visualization

After installation of the visualization package, ``asreview`` should
automatically detect it. Test this by:

.. code:: bash

    asreview --help

It should list the 'plot' modus.

Basic usage
-----------

State files that were created with the same ASReview settings can be put
together/averaged by putting them in the same directory. State files
with different settings/datasets should be put in different directories
to compare them.

As an example consider the following directory structure, where we have
two datasets, called ``ace`` and ``ptsd``, each of which have 8 runs:

::

    ├── ace
    │   ├── results_0.h5
    │   ├── results_1.h5
    │   ├── results_2.h5
    │   ├── results_3.h5
    │   ├── results_4.h5
    │   ├── results_5.h5
    │   ├── results_6.h5
    │   └── results_7.h5
    └── ptsd
        ├── results_0.h5
        ├── results_1.h5
        ├── results_2.h5
        ├── results_3.h5
        ├── results_4.h5
        ├── results_5.h5
        ├── results_6.h5
        └── results_7.h5

Then we can plot the results by:

.. code:: bash

    asreview plot ace ptsd

By default, the values shown are expressed as percentages of the total
number of papers. Use the ``-a`` or ``--absolute-values`` flags to have
them expressed in absolute numbers:

.. code:: bash

    asreview plot ace ptsd --absolute-values


Since version 0.15, you can plot project files (exported from asreview lab) as 
well. Use the following code:

.. code:: bash

    asreview plot my_project_file.asreview

Plot types
----------

There are four plot types implemented: *inclusion*,
*discovery*, *limit*, *progression*. They can be individually selected
with the ``-t`` or ``--type`` switch. Multiple plots can be made by
using ``,`` as a separator:

.. code:: bash

    asreview plot ace ptsd --type 'inclusion,discovery'

Inclusion
~~~~~~~~~

This figure shows the number/percentage of included papers found as a
function of the number/percentage of papers reviewed. Initial
included/excluded papers are subtracted so that the line always starts
at (0,0).

The quicker the line goes to a 100%, the better the performance.

.. figure:: https://raw.githubusercontent.com/asreview/asreview-visualization/master/docs/inclusions.png
   :alt: Inclusions

Discovery
~~~~~~~~~

This figure shows the distribution of the number of papers that have to
be read before discovering each inclusion. Not every paper is equally
hard to find.

The closer to the left, the better.

.. figure:: https://raw.githubusercontent.com/asreview/asreview-visualization/master/docs/discovery.png
   :alt: Discovery

Limit
~~~~~

This figure shows how many papers need to be read with a given
criterion. A criterion is expressed as "after reading *y* % of the
papers, at most an average of *z* included papers have been not been
seen by the reviewer, if he is using max sampling.". Here, *y* is shown
on the y-axis, while three values of *z* are plotted as three different
lines with the same color. The three values for *z* are 0.1, 0.5 and
2.0.

The quicker the lines touch the black (``y=x``) line, the better.

.. figure:: https://raw.githubusercontent.com/asreview/asreview-visualization/master/docs/limits.png
   :alt: Limits

Progression
~~~~~~~~~~~

This figure shows the average inclusion rate as a function of time,
number of papers read. The more concentrated on the left, the better.
The thick line is the average of individual runs (thin lines). The
visualization package will automatically detect which are directories
and which are files. The curve is smoothed out by using a Gaussian
smoothing algorithm.

.. figure:: https://raw.githubusercontent.com/asreview/asreview-visualization/master/docs/progression.png
   :alt: Progression


Plotting API
------------

To make use of the more advanced features and/or incorporate plotting 
into code, you can use the visualization package as a library using the 
build-in API.

API basic usage
~~~~~~~~~~~~~~~

To set up a plot for a generated HDF5 file (e.g. myreview.h5), this 
code can be used:

.. code:: python

    from asreviewcontrib.visualization.plot import Plot

    with Plot.from_paths(["myreview.h5"]) as plot:
        my_plot = plot.new(plot_type="INSERT_PLOT_TYPE")
        inc_plot.show()

`INSERT_PLOT_TYPE` must be set to one or more of the available plot type; *inclusion*, *discovery*, *limit*, *progression*.

Multiple plots can be generated at the same time by adding the state files to 
a list; ["myreview.h5", "myreview_2.h5"].


API Advanced usage
~~~~~~~~~~~~~~~~~~

Add a grid to the plot.

.. code:: python

    my_plot.set_grid()


Add limits to the plot.

.. code:: python

    my_plot.set_xlim('lowerlimit', 'upperlimit')
    my_plot.set_ylim('lowerlimit', 'upperlimit')

Add a legend to the plot.

.. code:: python

    my_plot.set_legend()

Add the Work Saved over Sampling (WSS) or Relevant References Found (RRF) line 
to the plot. Only available for inclusion-type plots (``plot_type="inclusion"``).

The percentage value used for the WSS and RRF metric can be set to any number 
from 0 to 100 (currently set to 95 and 10).

.. code:: python

    all_files = all(plot.is_file.values())

    for key in list(plot.analyses):
        if all_files or not plot.is_file[key]:
            inc_plot.add_wss(
                key, 95, add_text=show_metric_labels, add_value=True, add_text=True)
            inc_plot.add_rrf(
                key, 10, add_text=show_metric_labels, add_value=True, add_text=True)
    
Add the random line to the plot. This dashed grey diagonal line corresponds to 
the expected recall curve when publications are screened in random order.

.. code:: python

    my_plot.add_random(add_text=False)

Save the plot to the disk.

.. code:: python

    my_plot.save("myreview_plot.png")

To change the plot from relative to absolute values, an argument can be added 
to the plot the following way. ``INSERT_RESULT_FORMAT`` can be set to "number" for 
absolute values or "percentage" (default) for percentages.

.. code:: python

    with Plot.from_paths(["myreview.h5"]) as plot:
        my_plot = plot.new(plot_type="type", result_format="INSERT_RESULT_FORMAT")


Examples using the API can be found in module :code:`asreviewcontrib.visualization.quick`.
