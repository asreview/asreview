Command Line
============

ASReview provides a powerful command-line interface for running
tasks :doc:`../lab/start` and :doc:`../lab/simulation_cli`. Also, :doc:`extensions`
often make use of the command-line interface by extending it with
subcommands.

The structure of the command line is given by:

.. code-block:: bash

	asreview [-h] [-V] [subcommand]

A list of available and installed subcommands is given by :code:`asreview -h`.
Each subcommand is listed with its name, the package it comes from, and
the version of the package. For example, the default subcommand ``lab``
(to start ASReview LAB) is listed as ``lab [asreview-2.0]``. A
subcommand installed via an extension, e.g., ``plot``, is listed as ``plot
[asreview-insights-1.3]``, where ``asreview-insights`` is the name of the
extension that installed this subcommand, and 1.3 is the version of this
package.
