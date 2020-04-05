****************************************************
ASReview: Software for automating systematic reviews
****************************************************

ASReview is software designed to accelerate the process of systematic reviews. 
It is written in python, and uses deep learning to predict which papers should be
most likely included in the review. Our software is designed to accelerate the step
of screening abstracts and titles with a minimum of papers to be read by a 
human with no or very few false negatives.

Automated Systematic Review (ASReview) implements an oracle and a
simulation mode.

- **Oracle** The oracle modus is used to perform a systematic review with
  interaction by the reviewer (the 'oracle' in literature on active learning).
  The software presents papers to the reviewer, whereafter the reviewer classifies them.
- **Simulate** The simulation modus is used to measure the performance of our
  software on existing systematic reviews. The software shows how many
  papers you could have potentially skipped during the systematic review.

The source code is freely available at 
`GitHub <https://github.com/asreview/asreview>`_.

.. toctree::
   :maxdepth: 2
   :caption: Basics

   ASReview <self>

   installation

   activelearning

   quicktour

   covid-19
   
   datasets

   user_testing_algorithms

   extensions

   faq

.. toctree::
   :maxdepth: 2
   :caption: Advanced

   cli

   models

   query_strategies

   balance_strategies
  
   feature_extraction


.. toctree::
   :maxdepth: 2
   :caption: Development

   extensions_dev

   api

   reference

.. automodule:: asreview
   :members:

.. automodule:: asreview.models
   :members:

.. automodule:: asreview.query_strategies
   :members:

.. automodule:: asreview.balance_strategies
   :members:

.. automodule:: asreview.state
   :members:


Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`



Citation
========

A research paper is upcoming for this project. In the mean time, it can be 
cited with (fill in x and y for the version number):

ASReview Core Development Team (2019). ASReview: Software for automated systematic 
reviews [version 0.x.y]. Utrecht University, Utrecht, The Netherlands. Available at
https://github.com/asreview/asreview.

.. code-block:: text

	@Manual{
		title = {ASReview: Software for automated systematic reviews},
		author = {{ASReview Core Development Team}},
		organization = {Utrecht University},
		address = {Utrecht, The Netherlands},
		year = 2019,
		url = {https://pypi.org/project/asreview/}
	} 



