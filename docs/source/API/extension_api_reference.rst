Extension API reference
=======================
[TODO what is on this page]




Code with the ASReview API
--------------------------
[some explanation about how to use functions from asreview modules][TODO]

[This is the most important part. How do explain clearly and easily how to use
the modules of asreview in your own code. Next part is how to turn this code
into an extension. Not sure yet if this is the right page as you also use the
normal reference for coding. Maybe this should be somewhere in the extension
documentation?]

[WHERE SHOULD "HOW TO USE THE API" BE]

The extensibility of the framework is provided by the entrypoints of
setuptools. You will need to create a package and install it (for example with
pip).

.. _extensions-dev-model:

Model extension
-------------------

In the ASReview, an active learning model consists of classifier, query
strategy, balance strategy, or feature extraction technique. The easiest way to
extend ASReview with a model is by using the template `Template for extending
ASReview <https://github.com/asreview/template-extension-new-model>`__. Create a
copy of the template and add the new algorithms. It is advised to use the
following structure of the package:

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

Install the package with pip:

.. code:: bash

    pip install .

The new classifier is now available and can be used, for example, in the
simulate command line.

.. code:: bash

    asreview simulate example_data_file.csv -m example


If you are willing to share your work, the easiest way is to upload your
extension to GitHub and/or PyPi. Users can directly install the extension from
these sources.

.. _extensions-dev-subcommand:

Subcommand extension
---------------------------

Extensions in ASReview are Python packages and can extend the
subcommands of asreview (see ``asreview -h``).

The easiest way to create a new subcommand is by defining a class that can be
used as a new entry point for ASReview. This class should inherit from
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

After installing this package, ASReview is extended with the ``asreview
example`` subcommand. See ``asreview -h`` for this option.

If you are willing to share your work, the easiest way is to upload your
package to GitHub and/or PyPi. Users can directly install the extension from
these sources. Also, if you would like it to be added to the
documentation, please initiate an issue on `Github <https://github.com/asreview/asreview/issues/new/choose>`_.

.. _extensions-dev-dataset:

Dataset extension
------------------------

[TODO]