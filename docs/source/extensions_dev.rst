.. _Develop Extensions:

Extensions
==========

ASReview has support for extensions, which enable you to seemlessly integrate
your own programs with the ASReview framework. These extensions can extend the
software with new models, qurey strategies, balance strategies, and feature
extraction techniques. It is also possible to extend ASReview with completely
new subcommand (like ``lab`` of ``simulate``).

The extensibility of the framework is provided by the entrypoints of
setuptools. You will need to create a package and install it (for example with
pip). If you have no experience with creating packages, have a look at the
`visualization extension <https://github.com/asreview/ASReview-
visualization>`__ and modify it to suit your needs.

Available extensions
--------------------

- ``asreview-visualization``: Plotting functionality for state files produced by ASReview. `GitHub <https://github.com/asreview/asreview-visualization>`__
- ``asreview-statistics``: Tool to give some basic properties of a dataset, such as number of
  papers, number of inclusions. `GitHub <https://github.com/asreview/asreview-statistics>`__
- ``asreview-hyperopt``: Optimize the hyperparameters of the models in ASReview. `GitHub <https://github.com/asreview/asreview-hyperopt>`__

If an extension is not on this list, or you make one and want it added to this
list, make an issue on `github
<https://github.com/asreview/asreview/issues>`__.

Usage
-----

The `asreview-visualization <https://github.com/asreview/ASReview-
visualization>`__ extension extends ASReview to create basic plots from
ASReview state files. This section shows how to use this extension.

Install the extension with

.. code:: bash

    pip install asreview-visualization

After installation, the function ``plot`` is available in the command line.
See ``asreview -h`` for this option.

.. code:: bash

    $ asreview -h
    usage: asreview [-h] [-V] [subcommand]

    Automated Systematic Review (ASReview).

    positional arguments:
      subcommand     The subcommand to launch. Available commands:

                     lab [asreview-0.13]
                         Graphical user interface for ASReview.

                     simulate [asreview-0.13]
                         Simulate the performance of ASReview.

                     simulate-batch [asreview-0.13]
                         Parallel simulation for ASReview.

                     plot [asreview-visualization-0.2.2]
                         Plotting functionality for logging files produced by ASReview.

    optional arguments:
      -h, --help     show this help message and exit
      -V, --version  print the ASR version number and exit


With this extension installed, a plot can be made with of an ASReview state file. The following example shows how a plot is made of the file ``example_run_1.h5``.

.. code:: bash

    asreview plot example_run_1.h5


Create new subcommand
---------------------

Extensions in ASReview are Python packages. Extension packages can extend the
subcommands of asreview (see ``asreview -h``) or add new algorithms.

The easiest way to create an extension is by defining a class that can be used
as a new entry point for ASReview. This class should inherit from
:class:`asreview.entry_points.BaseEntryPoint`. Add the functionality to the
class method ``execute``.

.. code:: python

    from asreview.entry_points import BaseEntryPoint

    class ExampleEntryPoint(BaseEntryPoint):

        description = "Description of example extension"
        extension_name = "asreview-example"  # Name of the extension
        version = "1.0"  # Version of the extension in x.y(.z) format.

        def execute(self, argv)
            pass  # Implement your functionality here.

It is strongly recommended to define the attributes ``description``,
``extension_name``, and ``version``.

The class method ``execute`` accepts a positional arugument (``argv`` in this
example).  First create the functionality you would like to be able to use in
any directory. The argument ``argv`` are the command line arguments left after
removing asreview and the entry point.

It is advised to place the newly defined class ``ExampleEntryPoints`` in the
following package structure:
``asreviewcontrib.{extension_name}.{your_modules}``. Create a ``setup.py`` in
the root of the package, and set the keyword argument `entry_points` of
``setup()`` under ``asreview.entry_points``, for example:

.. code:: python

    entry_points={
        "asreview.entry_points": [
            "plot = asreviewcontrib.example.entrypoint:ExampleEntryPoint",
        ]
    }

If you are willing to share your work, the easiest way is to upload your
package to GitHub and/or PyPi. Users can directly install the extension from
these sources.

Add new model
-------------

Work in progress

