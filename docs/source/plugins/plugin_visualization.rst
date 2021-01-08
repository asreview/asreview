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

Plot types
----------

There are currently four plot types implemented: *inclusion*,
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

API
---

To make use of the more advanced features, you can also use the
visualization package as a library. The advantage is that you can make
more reproducible plots where text, etc. is in the place *you* want it.
Examples can be found in module ``asreviewcontrib.visualization.quick``.
Those are the scripts that are used for the command line interface.

.. code:: python

    from asreviewcontrib.visualization.plot import Plot

    with Plot.from_paths(["PATH_1", "PATH_2"]) as plot:
        inc_plot = plot.new("inclusion")
        inc_plot.set_grid()
        inc_plot.set_xlim(0, 30)
        inc_plot.set_ylim(0, 101)
        inc_plot.set_legend()
        inc_plot.show()
        inc_plot.save("SOME_FILE.png")

Of course fill in ``PATH_1`` and ``PATH_2`` as the files you would like
to plot.

If the customization is not sufficient, you can also directly manipulate
the ``self.ax`` and ``self.fig`` attributes of the plotting class.
