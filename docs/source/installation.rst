Installation
============

.. contents:: Table of Contents

+---------+---------+
| `ASReview Installation Guide for Windows <#install-asreview-for-windows-users>`__      |  `ASReview Installation Guide for macOS <#install-asreview-for-macOS-users>`__      |
+---------+---------+





If you run into any issues during the installation, please consult
`the FAQ <faq.html>`__ to solve the issue. Some common errors are explained.

Install ASReview for Windows users
----------------------------------

Step 1. Install Python
~~~~~~~~~~~~~~~~~~~~~~

The ASReview software runs with Python in the background. Therefore, running ASReview requires having Python 3.6+ installed. More knowledge about Python is not necessary to run ASReview, but if you want to know more you can look on their `website <https://www.python.org/about/>`__.

First, check if Python is already installed on your computer. Open the Command Prompt (search for `CMD.exe`) on your computer. Within this prompt, execute the following:

.. code::

    python --version

.. figure:: ../images/installation/check_python_version.png
   :alt:

Now, if the command returns `'python' is not recognized as an internal or external command`, you will need to install Python.

Go to https://www.python.org/downloads/ to download the latest Python version for Windows. You can follow the default installation instructions.
__IMPORTANT__: make sure to check the following box to add Python to your PATH environment variable:

.. figure:: ../images/installation/add_to_path.png
   :alt:

After installing Python, make sure to close and reopen your Command prompt (`CMD.exe`), and again, within this prompt, execute:

.. code::

    python --version

to check if Python has been properly installed:

.. figure:: ../images/installation/check_python_version_again.png
   :alt:

You can now proceed to the following `section 'Installing ASReview' <#step-2.-install-asreview>`__.


Step 2. Install ASReview
~~~~~~~~~~~~~~~~~~~~~~~~
If your Python version is 3.6+, you can start installing the ASReview
software on your computer.

To install the ASReview software, execute the following in the Command prompt (`CMD.exe`):

.. code::

    pip install asreview

If ASReview was installed succesfully, the last line should return something like

`Successfully installed asreview-0.9.6`

Step 3. Launch ASReview
~~~~~~~~~~~~~~~~~~~~~~~
You are now ready to start using ASReview!
Launch ASReview by executing in the Command prompt:

.. code::

    asreview oracle

A web browser will open. Please follow the step in our Quick Tour on how to carry out your first Automated Systematic Review! -add link!-

--------------------------------------------------------------------------------

Install ASReview for MacOS users
--------------------------------

Install Python
~~~~~~~~~~~~~~
The ASReview software runs with Python in the background. Therefore, running ASReview requires having Python 3.6+ installed. More knowledge about Python is not necessary to run ASReview, but if you want to know more you can look on their `website <https://www.python.org/about/>`__.

First check if Python is already installed on your computer. Open the program
`Terminal` on your computer. Type the following

.. code:: bash

    python --version

If the command returns `python: command not found`, then Python isn't
installed. If your Python version is 3.6.x or higher, you can proceed to
`section 'Installing ASReview' <#install-asreview>`__.

To install a recent version of Python, we recommend to install Anaconda.
Anaconda offers a user-friendly Python environment. Install Anaconda from
the website `Anaconda for MacOS <https://docs.anaconda.com/anaconda/install/mac-os/>`__.
Make sure to add Anaconda to your PATH environment variable when asked.
Afterwards, repeat the step above to check if Python is installed.


Install ASReview
----------------

If your Python version is 3.6+, you can start installing the ASReview
software on your computer.

To install the ASReview software, run the following in the `CMD.exe` (Windows)
or `terminal` (MacOS):

.. code:: bash

    pip install asreview

If ASReview was installed succesfully, the last line should return
`Successfully installed asreview-0.9`


You are now ready to start your first Automated Systematic Review!
Follow the the step in our Quick Tour.

In case you do not get this output, please consult
`the FAQ <faq.html>`__ to solve the issue.


Upgrade ASReview
~~~~~~~~~~~~~~~~

Upgrade ASReview software with

.. code:: bash

    pip install --upgrade asreview

--------------------------------------------------------------------------------

Server installation
-------------------

Although ASReview should only be used in closed networks, it is possible to
run on a server or custom domain. Use the command line arguments `ip` and
`port` for configuration.

.. code:: bash

    asreview oracle --port 5555 --ip xxx.x.x.xx

--------------------------------------------------------------------------------

Troubleshooting
---------------
The following section describes familiar errors and how to solve them.
If this information does not solve your error, please let us know by filing an issue in our GitHub repository (or, if you do not have a GitHub account, send us an e-mail at asreview@uu.nl)


Unknown command "pip" on command line or terminal
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you get one of the following errors:

.. code::

  -bash: pip: No such file or directory

.. code::

  'pip' is not recognized as an internal or external command, operable program or batch file.

Most likely, the enviroment variables aren't configured correctly. There are
tutorials on the internet to deal with this. However, a simple way to deal
with this is adding `python -m` in front of the command. For example:


.. code:: bash

  python -m pip install asreview

Unknown command "asreview" on command line or terminal
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In some situations, the entry point "asreview" can not be found after installation.
First check whether the package is correctly installed. Do this with the command
`python -m asreview -h`. If this shows a decription of the program, please use
`python -m` in front of all your commands. For example:


.. code-block:: bash

  python -m asreview oracle


No module named 'pip'
~~~~~~~~~~~~~~~~~~~~~
When installing or upgrading ASReview, it can occur that you run into the following warning:

.. code-block:: bash

    WARNING: You are using pip version 19.2.3, however version 20.1.1 is available.
    You should consider upgrading via the 'python -m pip install --upgrade pip' command.

Or even run into error `No module named 'pip'`:

.. figure:: ../images/installation/upgrade_error_no_pip_module.jpg
   :alt:

You can solve this error by executing:

.. code-block::

  python -m ensurepip

Followed by

.. code-block::

  python -m pip install --upgrade pip

Now you should be able to upgrade ASReview by executing:

.. code-block::

    pip install --upgrade asreview

Or if the last command is not succesful, try:

.. code-block::

    python -m pip install --upgrade asreview

instead.

Python3 command
~~~~~~~~~~~~~~~

Some users have to call the `python3` binary instead of just `python`. At the
moment, this will result is a freeze in Step 5 of the review. The model is not
able to train. Solve this by making `python3` the default `python` executable
on your device or make a virtual environment.

.. code:: bash

    python3 -m venv asreview/env
    source ~/asreview/env/bin/activate

Install and run `asreview` in the virtual enviroment.

.. code:: bash

    pip install asreview
    asreview oracle

For more details on creating a virtual environment, please have a look at
https://docs.python.org/3/library/venv.html.
