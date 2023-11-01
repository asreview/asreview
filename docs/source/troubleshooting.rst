Troubleshooting
===============

ASReview LAB is advanced machine learning software. In some situations, you
might run into unexpected behavior. See below for solutions to
problems.

Unknown Command "pip"
---------------------

The command line returns one of the following messages:

.. code:: bash

  -bash: pip: No such file or directory

.. code:: bash

  'pip' is not recognized as an internal or external command, operable program or batch file.


First, check if Python is installed by using the following command:

.. code:: bash

    python --version

If this doesn't return a version number, then Python is either not installed
or not correctly installed


Most likely, the environment variables aren't configured correctly. Follow
the step-by-step installation instruction on the ASReview website (`Windows <https://asreview.ai/download/>`__
and `MacOS <https://asreview.ai/download/>`__).

However, there is a simple way to deal with correct environment variables
by adding `python -m` in front of the command. For example:

.. code:: bash

  python -m pip install asreview


Unknown command "asreview"
--------------------------

In some situations, the entry point "asreview" can not be found after installation.
First check whether the package is correctly installed. Do this with the command
`python -m asreview -h`. If this shows a decryption of the program, use
`python -m` in front of all your commands. For example:

.. code-block:: bash

  python -m asreview lab


Build dependencies error
------------------------

The command line returns the following message:

.. code:: bash

  "Installing build dependencies ... error"

This error typically happens when the version of your Python installation has been
released very recently. Because of this, the dependencies of ASReview are not
compatible with your Python installation yet. It is advised to install
the second most recent version of Python instead. Detailed step-by-step instructions
to install Python (and ASReview) are available for
`Windows <https://asreview.ai/download/>`__ and
`MacOS <https://asreview.ai/download/>`__ users.

Remove temporary files
----------------------

In case ASReview runs into unexpected errors or doesn't work as expected, it
is advised to try to remove temporary files from the project first. These
files can be found in the ``.asreview/`` folder in your home directory.
However, the easiest way to remove these files is with:

.. code:: bash

  asreview lab --clean-all-projects

This will safely remove temporary files, nothing will harm your review. To
clean a specific project, use

.. code:: bash

  asreview lab --clean-project my-project

in which ``my_project`` is your project name.
