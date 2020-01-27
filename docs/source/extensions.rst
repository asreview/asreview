Extensions
==========

ASReview has support for extensions, which enable you to seemlessly integrate your own programs with
the ASReview framework. 

As an example we have created the 
`asreview-visualization <https://github.com/msdslab/ASReview-visualization>`__ extension to make basic
plots with ASReview log files as a source.

After installation, a new mode is available and we are able to plot a directory with log files as:

.. code:: bash

	asreview plot DIR_WITH_LOG_FILES


Available extensions
--------------------

- asreview-visualization: Plotting functionality for logging files produced by ASReview.

If an extention is not on this list, or you make one and want it added to this list, make an issue
on `github <https://github.com/msdslab/automated-systematic-review/issues>`__ or send us an email.


How to make an extension
------------------------

We have created a :ref:`guide<Develop Extensions>` to create your own extensions.
