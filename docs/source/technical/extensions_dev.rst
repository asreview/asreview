Extensions
==========

ASReview extensions enable you to integrate your programs with the ASReview
framework seamlessly, by using the Python API. These extensions fall into three
different categories, and interact with the API in different ways.

1. `Model extensions`_
2. `Subcommand extensions`_
3. `Dataset extensions`_

The extensibility of the framework is provided by the entrypoints of
setuptools. You will need to create a package and install it (for example with
pip).

Did you develop a useful extension to ASReview and want to list it on `the
Discussion platform
<https://github.com/asreview/asreview/discussions/1140>`__? Create a Pull
Request or open an issue on `GitHub
<https://github.com/asreview/asreview/issues>`__.

For more information on the ASReview API for creating an extension, a technical
reference for development is found under the :doc:`reference/asreview`. This
technical reference contains functions for use in your extension, and an
overview of all classes to extend on.


Model Extensions
----------------

An extension of a :class:`asreview.models.base.BaseModel` type class.

Model extensions extent the ASReview software with new classifiers, query
strategies, balance strategies, or feature extraction techniques. These
extensions extend one of the model base classes
(:class:`asreview.models.balance.base`,
:class:`asreview.models.classifiers.base`,
:class:`asreview.models.feature_extraction.base`,
:class:`asreview.models.query.base`).

The easiest way to extend ASReview with a model is by using the |template_link|.
Create a copy of the template and add the new algorithm to a new model file. It
is advised to use the following structure of the package:

.. code:: bash

    ├── README.md
    ├── asreviewcontrib
    │   └── models
    │       ├── classifiers
    │       │   ├── __init__.py
    │       │   └── example_model.py
    │       ├── feature_extraction
    │       │   ├── __init__.py
    │       │   └── example_feature_extraction.py
    │       ├── balance
    │       │   ├── __init__.py
    │       │   └── example_balance_strategies.py
    │       └── query
    │           ├── __init__.py
    │           └── example_query_strategies.py
    ├── setup.py
    └── tests

The next step is to add metadata to the `setup.py
<https://github.com/asreview/template-extension-new-model/blob/main/setup.py>`__
file. Edit the ``name`` of the package and point the ``entry_points`` to the
models.

.. code:: bash

    entry_points={
        'asreview.models.classifiers': [
            'example = asreviewcontrib.models.classifiers.example_model:ExampleClassifier',
        ],
        'asreview.models.feature_extraction': [
            # define feature_extraction algorithms
        ],
        'asreview.models.balance': [
            # define balance_strategy algorithms
        ],
        'asreview.models.query': [
            # define query_strategy algorithms
        ]
    },

This code registers the model with name ``example``.

.. |template_link| raw:: html

    <a href="https://github.com/asreview/template-extension-new-model"
    target="_blank"> template for extending ASReview</a>

Subcommand Extensions
---------------------

An extension of the :class:`asreview.entry_points.base.BaseEntryPoint` class.

Subcommand extensions are programs that create a new entry point for ASReview.
From this entry point the Python API can be used in many ways (like ``plot`` or
``simulate``).

Extensions in ASReview are Python packages and can extend the subcommands of
asreview (see ``asreview -h``). An example of a subcommand extension is
`ASReview Insights <https://github.com/asreview/asreview-insights>`_.

The easiest way to create a new subcommand is by defining a class that can be
used as a new entry point for ASReview. This class should inherit from
:class:`asreview.entry_points.base.BaseEntryPoint`. Add the functionality to the
class method ``execute``.

.. code:: python

    from asreview.entry_points import BaseEntryPoint

    class ExampleEntryPoint(BaseEntryPoint):

        description = "Description of example extension"
        extension_name = "asreview-example"  # Name of the extension
        version = "1.0"  # Version of the extension in x.y(.z) format.

        def execute(self, argv):
            pass  # Implement your functionality here.

It is strongly recommended to define the attributes ``description``,
``extension_name``, and ``version``.

The class method ``execute`` accepts a positional argument (``argv`` in this
example).  First create the functionality you would like to be able to use in
any directory. The argument ``argv`` are the command line arguments left after
removing asreview and the entry point.

It is advised to place the newly defined class ``ExampleEntryPoints`` in the
following package structure:
``asreviewcontrib.{extension_name}.{your_modules}``. For example:

.. code:: bash

    ├── README.md
    ├── asreviewcontrib
    │   └── example
    │       ├── __init__.py
    │       ├── entrypoint.py
    │       └── example_utils.py
    ├── setup.py
    └── tests


Create a ``setup.py`` in
the root of the package, and set the keyword argument `entry_points` of
``setup()`` under ``asreview.entry_points``, for example:

.. code:: python

    entry_points={
        "asreview.entry_points": [
            "example = asreviewcontrib.example.entrypoint:ExampleEntryPoint",
        ]
    }

After installing this package, ASReview is extended with the ``asreview
example`` subcommand. See ``asreview -h`` for this option.


Dataset Extensions
------------------

An extension of the :class:`asreview.datasets.BaseDataSet` class.

Dataset extensions integrate new datasets for use in ASReview. Adding datasets
via extension provides quick access to the dataset via Command Line Interface or in
ASReview LAB.

It is advised to place the new dataset ``your_dataset`` in the
following package structure:

.. code:: bash

    ├── README.md
    ├── asreviewcontrib
    │   └── dataset_name
    │       ├── __init__.py
    │       └── your_dataset.py
    ├── data
    │   └── your_dataset.csv
    ├── setup.py
    └── tests

For minimal functionality, ``your_dataset.py`` should extent
:class:`asreview.datasets.BaseDataSet` and
:class:`asreview.datasets.BaseDataGroup`.

A working template to clone and use can be found at `Template for extending
ASReview with a new dataset
<https://github.com/asreview/template-extension-new-dataset>`_.


Further functionality can be
extensions of any other class in :mod:`asreview.datasets`.
