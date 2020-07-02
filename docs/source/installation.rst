Installation
============

.. contents:: Table of Contents

Install ASReview
----------------

ASReview software requires having Python 3.6 or higher installed. Detailed
step-by-step instructions to install Python (and ASReview) are available for
`Windows <https://asreview.nl/installation-guide-windows/>`__ and
`MacOS <https://asreview.nl/installation-guide-macos/>`__ users.

Install the ASReview software with Pip by running the following command in the
`CMD.exe` (Windows) or `Terminal` (MacOS/Linux):

.. code:: bash

    pip install asreview

Start the application with the following command (in CMD.exe or Terminal):

.. code:: bash

    asreview oracle

You are now ready to start your first Automated Systematic Review!

Please see the `Troubleshooting <installation.html#troubleshooting>`__ section for common problems.


Upgrade ASReview
~~~~~~~~~~~~~~~~

Upgrade ASReview software with

.. code:: bash

    pip install --upgrade asreview


Server installation
-------------------

It is possible to run the ASReview software on a server or custom domain. Use
the flags `ip` and `port` for configuration. ASReview should only be used in
closed networks.

.. code:: bash

    asreview oracle --port 5555 --ip xxx.x.x.xx

Troubleshooting
---------------

Unknown command "pip"
~~~~~~~~~~~~~~~~~~~~~

The command line returns one of the following messages:

.. code:: bash

  -bash: pip: No such file or directory

.. code:: bash

  'pip' is not recognized as an internal or external command, operable program or batch file.


First, check if Python is installed with the following command:

.. code:: bash

    python --version

If this doesn't return 3.6 or higher, then Python isn't or not correctly
installed.

Most likely, the enviroment variables aren't configured correctly. Follow
our detailed step-by-step instructions to install Python correctly on
`Windows <https://asreview.nl/installation-guide-windows/>`__
and `MacOS <https://asreview.nl/installation-guide-macos/>`__.

However, there is a simple way to deal with correct environment variables
by ading `python -m` in front of the command. For example:

.. code:: bash

  python -m pip install asreview


Unknown command "asreview"
~~~~~~~~~~~~~~~~~~~~~~~~~~

In some situations, the entry point "asreview" can not be found after installation.
First check whether the package is correctly installed. Do this with the command
`python -m asreview -h`. If this shows a decription of the program, please use
`python -m` in front of all your commands. For example:

.. code-block:: bash

  python -m asreview oracle

