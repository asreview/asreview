Developing Extensions
=====================

ASReview extensions enable you to integrate your programs with the ASReview
framework seamlessly by using the Python API. These extensions fall into three
different categories and interact with the API in different ways.

1. `Model extensions`_
2. `Subcommand extensions`_
3. `Dataset extensions`_

The extensibility of the framework is provided by the entry points of
setuptools. You will need to create a package and install it (for example, with
pip).

Did you develop a useful extension to ASReview and want to list it on `the
Discussion platform <https://github.com/asreview/asreview/discussions/1140>`__?
Leave a message there, and we will add it to the list of extensions.

For more information on the ASReview API for creating an extension, a technical
reference for development is found under the :doc:`reference/asreview`. This
technical reference contains functions for use in your extension and an overview
of all classes to extend.

Model Extensions
----------------

Model extensions extend the ASReview software with new classifiers, query
strategies, balance strategies, or feature extraction techniques. Model
extensions are Python packages that can be installed in the ASReview
environment. Model extensions typically inherit from the
:class:`sklearn.base.BaseEstimator` class in Scikit-learn or have a similar
interface. The model extensions can be used in the ASReview LAB and via the
Command Line Interface (CLI).

The easiest way to extend ASReview with a model is by using the |template_link|.
Create a copy of the template and add the new algorithm to a new model file. It
is advised to use the following structure of the package:

.. code:: bash

    ├── README.md
    ├── asreviewcontrib
    │   └── models
    │       ├── classifiers.py
    │       ├── feature_extractors.py
    │       ├── balancers.py
    │       └── queriers.py
    └── tests

The next step is to add metadata to the ``pyproject.toml`` file. Edit the
``name`` of the package and point the ``entry-points`` to the models.

.. code:: toml

    [project]

    name = "asreviewcontrib-yourmodel"

    [project.entry-points."asreview.models.classifiers"]

    example = "asreviewcontrib.models.classifiers.example_model:ExampleClassifier"

    [project.entry-points."asreview.models.feature_extractors"]

    # define feature_extraction algorithms

    [project.entry-points."asreview.models.balancers"]

    # define balance_strategy algorithms

    [project.entry-points."asreview.models.queriers"]

    # define query_strategy algorithms

This code registers the model with name ``example``.

.. |template_link| raw:: html

    <a href="https://github.com/asreview/template-extension-new-model"
    target="_blank"> template for extending ASReview</a>

Subcommand Extensions
---------------------

Subcommand extensions are programs that create a new entry point for ASReview.
From this entry point the Python API can be used in many ways (like ``plot`` or
``simulate``).

Extensions in ASReview are Python packages and can extend the subcommands of
asreview (see ``asreview -h``). An example of a subcommand extension is
`ASReview Insights <https://github.com/asreview/asreview-insights>`_.

The easiest way to create a new subcommand is by defining a function or class
with `execute` method that can be used as a new entry point for ASReview.

.. code:: python

    class ExampleEntryPoint:

        def execute(self, argv):
            pass  # Implement your functionality here.

The class method ``execute`` accepts a positional argument (``argv`` in this
example).  The argument ``argv`` are the command line arguments for your
subcommand.

It is advised to place the newly defined entry point in the following package
structure: ``asreviewcontrib.{extension_name}.{your_modules}``. For example:

.. code:: bash

    ├── README.md
    ├── asreviewcontrib
    │   └── example
    │       ├── __init__.py
    │       ├── entrypoint.py
    │       └── example_utils.py
    ├── pyproject.toml
    └── tests

Create a ``pyproject.toml`` in the root of the package, and define the entry
points under ``[project.entry-points."asreview.entry_points"]``, for example:

.. code:: toml

    [project] name = "asreviewcontrib-example"

    # ...other metadata...

    [project.entry-points."asreview.entry_points"]

    example = "asreviewcontrib.example.entrypoint:ExampleEntryPoint"

After installing this package, ASReview is extended with the ``asreview
example`` subcommand. See ``asreview -h`` for this option.

Dataset Extensions
------------------

An extension of the :class:`asreview.datasets.BaseDataSet` class.

Dataset extensions integrate new datasets for use in ASReview. Adding datasets
via extension provides quick access to the dataset via Command Line Interface or
in ASReview LAB.

It is advised to place the new dataset ``your_dataset`` in the following package
structure:

.. code:: bash

    ├── README.md
    ├── asreviewcontrib
    │   └── dataset_name
    │       ├── __init__.py
    │       └── your_dataset.py
    ├── data
    │   └── your_dataset.csv
    ├── pyproject.toml
    └── tests

For minimal functionality, ``your_dataset.py`` should extend
:class:`asreview.datasets.BaseDataSet` and
:class:`asreview.datasets.BaseDataGroup`.

A working template to clone and use can be found at `Template for extending
ASReview with a new dataset
<https://github.com/asreview/template-extension-new-dataset>`_.

Further functionality can be extensions of any other class in
:mod:`asreview.datasets`.
