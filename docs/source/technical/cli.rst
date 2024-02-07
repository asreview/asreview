Command Line
============

ASReview provides a powerful command line interface for running
tasks :doc:`../lab/start` and :doc:`../lab/simulation_cli`. Also :doc:`extensions_dev`
often make use of the command line interface by extending it with
subcommands.

The structure of the command line is given by:

.. code-block:: bash

	asreview [-h] [-V] [subcommand]

A list of available and installed subcommands is given by :code:`asreview -h`.
Each subcommand is listed with its subcommand, the package it comes from and
the version of the package. For example, the default subcommand ``lab``
(to start ASReview LAB) is given by listed as ``lab [asreview-1.0]``. An
subcommand installed via an extension, e.g. ``plot``, is listed as ``plot
[asreview-insights-1.1]`` where ``asreview-insights`` is the name of the
extension that installed this subcommand and 1.1 is the version of this
package.
