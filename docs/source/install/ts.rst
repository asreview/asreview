Troubleshooting
===============

In some situations, you might run into unexpected behavior. You can find solutions to
some problems as follows:

Unknown command "pip"
---------------------

The command line returns one of the following messages:

.. code-block:: bash

    -bash: pip: No such file or directory

.. code-block:: bash

    'pip' is not recognized as an internal or external command, operable program or batch file.

First, check if Python is installed with the following command:

.. code-block:: bash

    python --version

If this doesn't return 3.7 or later, then Python isn't or not correctly installed.

Most likely, the enviroment variables aren't configured correctly. Follow the
instruction to :ref:`install Python <install_python>`.

However, there is a simple way to deal with correct environment variables by adding
`python -m` in front of the command. For example:

.. code-block:: bash

    python -m pip install asreview

Unknown command "asreview"
--------------------------

In some situations, the entry point "asreview" can not be found after installation.
First check whether the package is correctly installed. Do this with the command `python
-m asreview -h`. If this shows a decription of the program, use `python -m` in front of
all your commands. For example:

.. code-block:: bash

    python -m asreview lab

Build dependencies error
------------------------

The command line returns the following message:

.. code-block:: bash

    "Installing build dependencies ... error"

This error typically happens when the version of your Python installation has been
released very recently. Because of this, the dependencies of ASReview are not compatible
with your Python installation yet. It is advised to install the second most recent
version of Python instead. Follow the instruction to :ref:`install Python
<install_python>`.

Remove temporary files
----------------------

In case ASReview runs into unexpected errors or doesn't work as expected, it is advised
to try to remove temporary files from the project first. These files can be found in the
``.asreview/`` folder in your home directory. However, the easiest way to remove these
files is with:

.. code-block:: bash

    asreview lab --clean-all-projects

This will safely remove temporay files, nothing will harm your review. To clean a
specific project, use

.. code-block:: bash

    asreview lab --clean-project my-project

in which ``my_project`` is your project name.
