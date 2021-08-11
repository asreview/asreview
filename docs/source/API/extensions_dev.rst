.. _develop-extensions:

Extensions
==========

ASReview has support for extensions, which enable you to integrate your
programs with the ASReview framework seamlessly. These extensions can extend
the software with new :ref:`models <extensions-dev-model>` (i.e., classifiers,
query strategies, balance strategies, or feature extraction techniques). It is
also possible to extend ASReview with a completely new :ref:`subcommand
<extensions-dev-subcommand>` (like ``lab`` or ``simulate``).

The extensibility of the framework is provided by the entrypoints of
setuptools. You will need to create a package and install it (for example with
pip). If you have no experience with creating packages, look at the
`visualization extension <https://github.com/asreview/ASReview-
visualization>`__ and modify it to suit your needs.

If you made an extension and you would like it to be added to the
documentation, please initiate an issue on `Github <https://github.com/asreview/asreview/issues/new/choose>`_.

Usage
-----

This section shows how to use an extension. In this example, the
`asreview-visualization <https://github.com/asreview/ASReview-visualization>`__
extension is used. The extension extends ASReview to create basic plots from
ASReview state files.

Install the extension with

.. code:: bash

    pip install asreview-visualization

After installation, the subcommand ``plot`` is available in the command line.
See ``asreview -h`` for this option.

With this extension installed, a plot can be made with an ASReview state
file. The following example shows how a plot is made of the file
``example_run_1.h5``.

.. code:: bash

    asreview plot example_run_1.h5



.. _extensions-dev-subcommand:

Create subcommand
-----------------

Extensions in ASReview are Python packages and can extend the
subcommands of asreview (see ``asreview -h``).

The easiest way to create a new subcommand is by defining a class that can be used
as a new entry point for ASReview. This class should inherit from
:class:`asreview.entry_points.BaseEntryPoint`. Add the functionality to the
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

The class method ``execute`` accepts a positional arugument (``argv`` in this
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

After installing this package. ASReview is extended with the ``asreview
example`` subcommand.

If you are willing to share your work, the easiest way is to upload your
package to GitHub and/or PyPi. Users can directly install the extension from
these sources. Also, if you would like it to be added to the
documentation, please initiate an issue on `Github <https://github.com/asreview/asreview/issues/new/choose>`_.


.. _extensions-dev-model:

Add model
---------

In the ASReview, an active learning model consists of classifier,
query strategy, balance strategy, or feature extraction technique. The easiest
way to extend ASReview with a model is by using the template `Template
for extending ASReview <https://github.com/asreview/template- extension-new-
model>`__. Create a copy of the template and add the new algorithms. It is
advised to use the following structure of the package:

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

The next step is to add metadata to the `setup.py <https://github.com/asreview
/template-extension-new-model/blob/main/setup.py>`__ file. Edit the ``name``
of the package and point the ``entry_points`` to the models.

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

Install the package with pip:

.. code:: bash

    pip install .

The new classifier is now available and can be used, for example, in the
simulate command line.

.. code:: bash

    asreview simulate example_data_file.csv -m example


If you are willing to share your work, the easiest way is to upload your
extension to GitHub and/or PyPi. Users can directly install the extension from
these sources. Also, if you would like it to be added to the
documentation, please initiate an issue on `Github <https://github.com/asreview/asreview/issues/new/choose>`_.
