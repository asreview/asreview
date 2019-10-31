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

	asreview oracle YOUR_DATA.csv --log_file myreview.h5


Example output:

.. image:: ../gifs/asreview-intro.gif


To benchmark an already executed review, use the simulation modus (`asreview simulation`).
The dataset needs an additional column ("label_included") to signify their inclusion
in the final review. The command for the simulation modus is similar to the oracle
mode.

.. code-block:: bash

	asreview simulate YOUR_DATA.csv --n_prior_included 5 --n_prior_excluded 5 --log_file myreview.h5
