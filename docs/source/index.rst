.. ASR documentation master file, created by
   sphinx-quickstart on Wed Feb 27 15:00:31 2019.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

*****************************************
ASReview: Software for systematic reviews
*****************************************

ASReview is software designed to accelerate the process of systematic reviews. 
It is written in python, and uses deep learning to predict which papers should be
most likely included in the review. Our software is designed to accelerate the step
of screening abstracts and titles with a minimum of papers to be read by a 
human with no or very few false negatives.

Our Automated Systematic Review (ASR) software implements an oracle and a
simulation mode.

- **Oracle** The oracle modus is used to perform a systematic review with
  interaction by the reviewer (the 'oracle' in literature on active learning).
  The software presents papers to the reviewer, whereafter the reviewer classifies them.
- **Simulate** The simulation modus is used to measure the performance of our
  software on existing systematic reviews. The software shows how many
  papers you could have potentially skipped during the systematic review.

The source code is freely available at 
`GitHub <https://github.com/msdslab/automated-systematic-review>`_.

Quick Start
===========


The ASR software requires Python 3.6+. The project is available on Pypi. Install the 
project with:

.. code-block:: bash

	pip install asreview

The quickest way to start using the Automated Systematic Review (ASR) software is
the Command Line Interface (CLI). 
Start an interactive systematic review (Oracle mode) with the following line in CMD or shell:

.. code-block:: bash

	asreview oracle YOUR_DATA.csv --prior_included 29 181 379 2001 3928 3929 4547 \
		--prior_included 31 90 892 3898 3989 4390 --log_file results.log


Example output:

.. code-block::

	Annual research review: The experience of youth with political conflict -
	Challenging notions of resilience and encouraging research refinement
	Barber, B. K.
	
	Aims and method Drawing on empirical studies and literature reviews, this
	...
	Authors. Journal of Child Psychology and Psychiatry © 2013 Association for
	Child and Adolescent Mental Health.
	
	Include [1] or exclude [0]:


To benchmark an already executed review, use the simulation modus (`asreview simulation`).
The dataset needs an additional column ("label_included") to signify their inclusion
in the final review. The command for the simulation modus is similar to the oracle
mode.

.. code-block:: bash

	asreview simulate YOUR_DATA.csv --prior_included 29 181 379 2001 3928 3929 4547 \ 
  		--prior_included 31 90 892 3898 3989 4390 --log_file results.log


Citation
========

A research paper is upcoming for this project. In the mean time, it can be 
cited with (fill in x and y for the version number):

ASReview Core Development Team (2019). ASReview: Software for automated systematic 
reviews [version 0.x.y]. Utrecht University, Utrecht, The Netherlands. Available at
https://github.com/msdslab/automated-systematic-review.

.. code-block:: bibtex

	@Manual{
		title = {ASReview: Software for automated systematic reviews},
		author = {{ASReview Core Development Team}},
		organization = {Utrecht University},
		address = {Utrecht, The Netherlands},
		year = 2019,
		url = {https://pypi.org/project/asreview/}
	} 


.. toctree::
   :maxdepth: 2
   :caption: Basics

   ASReview <self>

   10minutes_asreview

   cli

   api

.. toctree::
   :maxdepth: 2
   :caption: Reference

   models

   query_strategies

   balance_strategies

   reference

.. automodule:: asreview
   :members:

.. automodule:: asreview.models
   :members:

.. automodule:: asreview.query_strategies
   :members:

.. automodule:: asreview.balance_strategies
   :members:

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`



