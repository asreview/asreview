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

