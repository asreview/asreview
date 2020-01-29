.. _Develop Extensions:

Extensions
==========

The extensibility of the framework is provided by the entrypoints of setuptools. You will need to
create a package and install it (for example with pip). If you have no experience with creating
packages, have a look at our 
`visualization extension <https://github.com/asreview/ASReview-visualization>`__ and modify it to suit
your needs.


Program your extension
----------------------

First create the functionality you would like to be able to use in any directory. Say, some type of
analysis, or perhaps some more visualization options.

An extension may implement one or more entry points (e.g. ``plot`` or ``analyze``).

We advise you to use the following package structure: 
``asreviewcontrib.{extension_name}.{your_modules}``


Create the entry point class
----------------------------

The easiest way to create a class that can be used as a new entry point for ASReview is to create a
new class from the :class:`asreview.entry_points.BaseEntryPoint`. You only need to implement a
single member function:

.. code:: python

	def execute(self, argv)
		pass  # Implement your functionality here.

The argument ``argv`` are the arguments left after removing asreview and the entry point. In the 
case of our visualization extension example above, ``argv`` would be equal to ``DIR_WITH_LOG_FILES``.

It is also strongly recommended to define the following attributes:

- ``description``: A one sentence description what the entry point provides.
- ``extension_name``: Name of the extension it is part of.
- ``version``: Version of the extension. It is recommended to use the ``x.y(.z)`` format.

Entry points
------------

Create a ``setup.py`` according to your needs, and set the keyword argument `entry_points` of
``setup()`` under ``asreview.entry_points``, for example:

.. code:: python

    entry_points={"asreview.entry_points": [
            "plot = asreviewcontrib.visualization.entrypoint:PlotEntryPoint",
        ]}

\[Optional\] Share your extension!
----------------------------------

You are not in any way obliged to share your work with others, but we would love to know
how you use our software!

If you are willing to share your work, the easiest way is to upload your package to GitHub and/or 
PyPi. And don't forget to send us an issue/email, so that we can add it to the list of extensions.
