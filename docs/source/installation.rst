Installation
============

This tutorial will guide you in installing the ASReview software.
For a tutorial on how to perform a systematic review after installation, please refer to the
:doc:`Quick Tour <quicktour>`.

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
    Successfully installed asreview-0.8

You are now ready to start your first Automated Systematic Review!

In case you do not get this output, please consult
`the FAQ <faq.html>`__ to solve the issue.

Indicate your decision using the arrow keys.

