Extensions
==========

ASReview has support for extensions, which enable you to seemlessly integrate your own programs with
the ASReview framework. 

As an example we have created the 
`asreview-visualization <https://github.com/asreview/ASReview-visualization>`__ extension to make basic
plots with ASReview state files as a source.

After installation, a new mode is available and we are able to plot a directory with state files as:

.. code:: bash

	asreview plot DIR_WITH_STATE_FILES


Available extensions
--------------------

- asreview-visualization: Plotting functionality for state files produced by ASReview.
- asreview-statistics: Tool to give some basic properties of a dataset, such as number of
  papers, number of inclusions.
- asreview-simulate: Run batches of simulations.
- asreview-hyperopt: Optimize the hyperparameters of the models in ASReview.

If an extention is not on this list, or you make one and want it added to this list, make an issue
on `github <https://github.com/asreview/asreview/issues>`__ or send us an email.


How to make an extension
------------------------

We have created a :ref:`guide<Develop Extensions>` to create your own extensions.
