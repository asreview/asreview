10 minutes into ASReview
========================

This tutorial will guide you in running the ASReview software. It
consists of two parts, 0) `the installation of the ASReview
software <#installing-the-asreview-software>`__ and 1) `a
demonstration of the Oracle mode of the ASReview
software <#running-oracle-mode-with-the-ptsd-dataset>`__.

Installing the ASReview software
--------------------------------

Before installing the ASReview software, you have to set up the Command
Line Interface and Python.

The ASReview can be run through the Command Line Interface (CLI).
The CLI is operated by text inputs (commands),
rather than by a graphical interface with clickable buttons.
Don't worry if this is the first time you’re working in the CLI;
this tutorial will guide you through all the steps.

First, open the CLI on your computer:

-  In **macOS** , you can open the CLI by launching the ``Terminal``
   application. You can find this application in the ``Utilities``
   folder.
-  In **Windows**, the CLI is called the ``Command Prompt``. However,
   before you can operate the CLI, you have to install ``git bash``.
   Instructions can be found `on
   OpenHash <https://openhatch.org/missions/windows-setup/install-git-bash>`__.
-  In **Ubuntu**, you can open the CLI (called
   ``Terminal shell prompt``) by pressing ``CTRL`` ``ALT`` ``T``.

If you want to learn more about CLI, you can read `this
introduction <https://programminghistorian.org/en/lessons/intro-to-bash#opening-your-shell>`__.

The ASReview software requires Python 3.6+. To check the Python version
on your computer, type the following command in the CLI and press the
return button:

.. code:: bash

    python --version

This returns the version of the Python installation on
your computer. For example:

.. code:: bash

    Python 2.7.6

If your Python version is 3.6.x or higher, you can skip to `section
'Installing the ASReview software' <#install-asreview>`__.

If this is not the case, as in the example above, follow the
instructions in `the next section <#install-python>`__ to install a more
recent version of Python.

Install Python
~~~~~~~~~~~~~~

To install a recent version of Python, we recommend to install Anaconda.
Anaconda offers a user-friendly Python environment. Besides Anaconda,
there are other ways to install Python. For example, it is possible to
install Python through the CLI. However, this approach requires more
expertise. We recommend following the instructions
in this tutorial, which takes the Anaconda route.

The Anaconda distribution is available for Windows, macOS and Linux, and
can be downloaded `here <https://www.anaconda.com/distribution/>`__.
Users on a SolisLaptop can download the distribution from the Software
Center. Two versions of the distribution are available, 2.x and 3.x.
Make sure to download the 3.x distribution, which is the one is required for the
ASReview software.

After downloading the distribution, install Anaconda by following one of
the manuals below:

-  For Windows users, `click
   here <https://docs.anaconda.com/anaconda/install/windows/>`__
-  For macOS users, `click
   here <https://docs.anaconda.com/anaconda/install/mac-os/>`__
-  For Linux users, `click
   here <https://docs.anaconda.com/anaconda/install/linux/>`__

Re-check the version of the Python installation by typing ``python --version``
in the CLI. This should correspond to the 3.x version of Anaconda you installed
earlier.

Example: I installed Anaconda 3.7 and calling ``python --version`` in the
CLI returns:

.. code:: bash

    Python 3.7.3

Install ASReview
~~~~~~~~~~~~~~~~

If your Python version is 3.6+, you can start installing the ASReview
software on your computer. To install the ASReview software, follow the
steps below. If you’ve already installed the ASReview software, you can
skip to `the next section <#running-oracle-mode-with-the-ptsd-dataset>`__.

To install the ASReview software, run the following in the Terminal:

.. code:: bash

    pip install asreview

If ASReview was installed succesfully, you will get output like:

.. code:: bash

    Installing collected packages: asreview
    Successfully installed asreview-0.3.2

You are now ready to start your first Automated Systematic Review!

In case you do not get this output, please consult
`the FAQ <faq.html>`__ to solve the issue.

Performing a review with the PTSD dataset
-----------------------------------------

As an example, we use the PTSD dataset. This dataset contains titles
and abstracts of papers on post-traumatic stress disorder. From this dataset,
we aim to find all papers relevant to our systematic review, without reading
all abstracts. To start this process, run:

.. code:: bash

    asreview oracle example_ptsd --log_file myreview.h5 --new

The ``--new`` flag is only used because the PTSD dataset has already been labeled.
Ommitting this flag would start the review with an already finished review.
If you have a .ris or .csv file ready for review, you would replace ``example_ptsd`` with this file
instead:


.. code:: bash

	asreview oracle example_file.csv --log_file myreview.h5


The log file ``myreview.h5`` stores the details of your systematic review;
your review choices, model parameters, model predictions and more.

In case this command returns ` Unknown command “asreview” on command line or terminal`, please consult
`the FAQ <faq.html>`__ to solve the issue.


The following will show on your screen:

.. image:: ../gifs/asreview-intro.gif


After starting ASReview, you will be presented with a small menu with two options to
indicate which papers you know should be included or excluded beforehand. The first option is
to use the built-in paper finder, the second is to include papers by the order in which
they occur in your data file.

Remember that inclusions are much more important for the review software predictions
than exclusions.

Including and excluding papers using the paper finder
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The easiest way to find papers to include is by using the built-in paper finder.
Select the option ``Find papers by keywords``. You can now search your data set by authors,
keywords and title, or a combination thereof. You don't have to type in an exact match.
For example, if you are looking for a paper by Schoot with Bayesian in the title, you can
type ``schoot bayesian``, and the finder will search for papers matching that description.

After putting in your search words, you will be presented with a list of relevant papers to
your search criteria (minimum 1, maximum 10). Select and review paper(s), and return to the base menu.

Including and excluding papers by identifiers
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Another method of indication inclusions and exclusions before the main review process is by
giving the paper identifiers directly to the ASReview software. These identifiers are simply the
order of the papers in your dataset, starting from zero.

The software will first ask you to indicate papers you want
to **include** in your systematic review.

.. code:: bash

    Are there papers you definitively want to include?
    Give the indices of these papers. Separate them with spaces.
    Include:

You can now type the indices of papers you want to be included in your
systematic review, for example ``29 181 379 2001 3928 3929 4547``.

In case you don’t want to include any papers beforehand, just press the
return key.

The software will now ask for papers you want to **exclude** from your
systematic review.

.. code:: bash

    Are there papers you definitively want to exclude?
    Give the indices of these papers. Separate them with spaces.
    Exclude:

Here, type for example ``31 90 892 3898 3989 4390``, to indicate the
papers that you want to be excluded from your systematic review.

The systematic review process
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The software will attempt to classify the papers in the dataset into two
categories: papers to be included in, and papers to be excluded from the
systematic review. ASReview continuously improves its understanding
of your decisions, while you are doing your systematic review.

ASReview will present you with abstracts to review. After reviewing
a certain number of abstracts (by default 1), it will update the model.
You have to to let the software know whether you want
to include or exclude the presented abstract in your systematic review.
Indicate your decision using the arrow keys.

.. code::

    ----------------------------------
    Distributional Assumptions of Growth Mixture Models: Implications for Overextraction of Latent Trajectory Classes
    Bauer, Daniel J., Curran, Patrick J.

    Growth mixture models are often used to determine if subgroups exist within the population that follow qualitatively distinct developmental trajectories. However, statistical theory developed for finite normal mixture models suggests that latent trajectory classes can be estimated even in the absence of population heterogeneity if the distribution of the repeated measures is nonnormal. By drawing on this theory, this article demonstrates that multiple trajectory classes can be estimated and appear optimal for nonnormal data even when only 1 group exists in the population. Further, the within-class parameter estimates obtained from these models are largely uninterpretable. Significant predictive relationships may be obscured or spurious relationships identified. The implications of these results for applied research are highlighted, and future directions for quantitative developments are suggested. (PsycINFO Database Record (c) 2012 APA, all rights reserved) (journal abstract)
    ----------------------------------


    | 0.10% read | 0 since last inclusion | 0.00% included | total papers: 6/5782 |

	? Include or Exclude?  (Use arrow keys)
	> Exclude
	  Include
	  -----------
	  Stop

If you want to export the results of your review, go back to the main menu
and use the ``Export`` option. When prompted, provide a filename with either
a ``.csv`` or ``.ris`` file extension.

You can stop the review by using the ``Stop`` option. You can later continue the
review by providing the same log file (``myreview.h5``)

Under the hood
~~~~~~~~~~~~~~

At every iteration, ASReview ranks each paper by their likeliness of inclusion,
with the most likely papers presented first for reading. ASReview bases its
decisions on the titles and abstract of papers that you have either included or excluded
from the review so far. The higher the number of included/excluded papers, the better
the software understands your review choices.

ASReview is modular and there is a plethora of models and techniques available for the expert user.
However, for the majority of users, the default settings should suffice.
More specifically, you can choose different
`models <https://asreview.readthedocs.io/en/latest/models.html>`__,
`query strategies <https://asreview.readthedocs.io/en/latest/query_strategies.html>`__,
`feature extraction methods <https://asreview.readthedocs.io/en/latest/feature_extraction.html>`__,
and `rebalancing strategies <https://asreview.readthedocs.io/en/latest/balance_strategies.html>`__
in the ASReview software.

You can supply options in the ``asreview oracle`` command. If no options are specified, the ASReview
software will use the default options. Run ``asreview oracle --help`` to view
the options and defaults.

.. code:: bash

	usage: oracle [-h] [-m MODEL] [-q QUERY_STRATEGY] [-b BALANCE_STRATEGY]
	              [-e FEATURE_EXTRACTION] [--n_instances N_INSTANCES]
	              [--n_queries N_QUERIES] [-n N_PAPERS] [--embedding EMBEDDING_FP]
	              [--config_file CONFIG_FILE]
	              [--included_dataset [INCLUDED_DATASET [INCLUDED_DATASET ...]]]
	              [--excluded_dataset [EXCLUDED_DATASET [EXCLUDED_DATASET ...]]]
	              [--prior_dataset [PRIOR_DATASET [PRIOR_DATASET ...]]]
	              [--log_file LOG_FILE] [--save_model SAVE_MODEL_FP]
	              [--verbose VERBOSE] [--new]
	              [dataset [dataset ...]]
	
	Automated Systematic Review (ASReview) with interaction with oracle.
	
	The oracle modus is used to perform a systematic review with
	interaction by the reviewer (the ‘oracle’ in literature on active
	learning). The software presents papers to the reviewer, whereafter
	the reviewer classifies them.
	
	positional arguments:
	  dataset               File path to the dataset or one of the built-in datasets.
	
	optional arguments:
	  -h, --help            show this help message and exit
	  -m MODEL, --model MODEL
	                        The prediction model for Active Learning. Default: 'nb'.
	  -q QUERY_STRATEGY, --query_strategy QUERY_STRATEGY
	                        The query strategy for Active Learning. Default: 'max_random'.
	  -b BALANCE_STRATEGY, --balance_strategy BALANCE_STRATEGY
	                        Data rebalancing strategy mainly for RNN methods. Helps against imbalanced dataset with few inclusions and many exclusions. Default: 'triple'
	  -e FEATURE_EXTRACTION, --feature_extraction FEATURE_EXTRACTION
	                        Feature extraction method. Some combinations of feature extraction method and prediction model are impossible/ill advised.Default: 'tfidf'
	  --n_instances N_INSTANCES
	                        Number of papers queried each query.Default 1.
	  --n_queries N_QUERIES
	                        The number of queries. By default, the program stops after all documents are reviewed or is interrupted by the user.
	  -n N_PAPERS, --n_papers N_PAPERS
	                        The number of papers to be reviewed. By default, the program stops after all documents are reviewed or is interrupted by the user.
	  --embedding EMBEDDING_FP
	                        File path of embedding matrix. Required for LSTM models.
	  --config_file CONFIG_FILE
	                        Configuration file with model parameters
	  --included_dataset [INCLUDED_DATASET [INCLUDED_DATASET ...]]
	                        A dataset with papers that should be includedCan be used multiple times.
	  --excluded_dataset [EXCLUDED_DATASET [EXCLUDED_DATASET ...]]
	                        A dataset with papers that should be excludedCan be used multiple times.
	  --prior_dataset [PRIOR_DATASET [PRIOR_DATASET ...]]
	                        A dataset with papers from prior studies.
	  --log_file LOG_FILE, -l LOG_FILE
	                        Location to store the log results.
	  --save_model SAVE_MODEL_FP
	                        Location to store the model and weights. Only works for Keras/RNN models. End file extension with '.json'.
	  --verbose VERBOSE, -v VERBOSE
	                        Verbosity
	  --new                 Start review from scratch.

Wrapping up the Automated Systematic Review
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The ASReview software continuously presents abstracts either until the user decides to stop,
or until there are no abstracts left.
The longer you continue reading, the better the model will
understand your review requirements. You can stop reading abstracts at any time, by using the ``Stop`` option.
The decision of when to stop reviewing is made by the reviewer. Suggested stopping criteria could be stopping after
the last X presented abstracts were rejected.

You can view the results of your automated systematic review by using the `` Export`` option. This will create a CSV file
, which can be read by your favorite spreadsheet software (such as Microsoft Excel).

In the exported file, papers are ordered as follows: 1) the manually included papers, 2) the unlabeled papers by decreasing
likeliness of inclusion, 3) the manually excluded papers.
