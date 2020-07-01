Installation
============

.. contents:: Table of Contents

This is a guide on how to install ASReview. Please start by selecting the correct user manual for your operating system:

- **For the installation guide for Windows users, see** :ref:`windows-users`
- `**For the installation guide for Unix systems, such as macOS or Linux users, see** :ref:`unix-users`

**IMPORTANT: If you run into any issues during the installation, please consult :ref:`troubleshooting <the Troubleshooting section>`.**

.. _windows-users:

Install ASReview for Windows users
----------------------------------

1. Install Python (Windows)
~~~~~~~~~~~~~~~~~~~~~~~~~~~
This section explains how to install Python on your computer. The ASReview software runs with Python in the background. Therefore, running ASReview requires having Python 3.6+ installed. More knowledge about Python is not necessary to run ASReview.

First, check if Python is already installed on your computer. To do this, open the Command Prompt, by searching for ``CMD.exe``:

.. figure:: ../images/installation/command_prompt.png
   :alt:


Within this prompt, execute the following command:

.. code::

    python --version


.. figure:: ../images/installation/check_python_version.PNG
   :alt:

Now, if the command returns you have a Python version is 3.6 or higher, you can go to the :ref:`next-section <next section>`.

However, if the command returns something like ``'python' is not recognized as an internal or external command, operable program or batch file.``, you will still have to install Python.

.. figure:: ../images/installation/add_to_path.PNG
   :alt:

|
|

To install Python, go to |pylink| to download the latest Python version for Windows and follow the default installation instructions. **IMPORTANT**: make sure to check the following box to add Python to your PATH environment variable:
After installing Python, make sure to close and reopen your Command prompt (``CMD.exe``), and again, within this prompt, again execute:

.. |pylink| raw:: html

    <a href="https://www.python.org/downloads/" target="_blank">python.org/downloads </a>


.. code::

    python --version

to check if Python (version 3.6 or higher) has been properly installed:

.. figure:: ../images/installation/check_python_version_again.PNG
   :alt:

.. _next-section:

2. Install ASReview (Windows)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
If your Python version is 3.6 or higher, you can start installing the ASReview
software on your computer. Execute the following in the Command prompt (`CMD.exe`):

.. code::

    pip install asreview

If ASReview was installed succesfully, this command should return a bunch of text of which the last line is something like:

.. code::

    Successfully installed asreview-0.9.6

*Note: if you run into an error at this step, try executing `python -m pip install asreview` instead. If this doesn't fix your problems, please consult :ref:`_the Troubleshooting section <the Troubleshooting section>`.*


If you want to use our `COVID-19 plugin <covid-19.html>`__, you can install it at this step by executing:

.. code::

    pip install asreview-covid19

The plugin will be available automatically upon launching ASReview.

3. Launch ASReview (Windows)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Congratulations! You are now ready to start using ASReview.
Launch ASReview by executing in the Command prompt:

.. code::

    asreview oracle

A web browser will open the ASReview user interface. Please follow the steps in our |quicktour| on how to carry out your first Automated Systematic Review!


.. |quicktour| raw:: html

    <a href="https://asreview.readthedocs.io/en/latest/quicktour.html" target="_blank">Quick Tour </a>

--------------------------------------------------------------------------------

.. _unix-users:


Install ASReview for Unix users
-------------------------------
This guide provides installation steps for installing ASReview for macOS users. These steps should also suffice for users with other Unix-based systems, such as Linux.

1. Install Python (Unix)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
This section explains how to install Python on your computer. The ASReview software runs with Python in the background. MacOS comes with Python version 2.7 already installed. However, ASReview requires Python 3.6 or higher and therefore, a more recent version of Python should be installed. More knowledge about Python is not necessary to run ASReview.

First, check which version of Python is currently installed on your computer. Open the program `Terminal` on your computer.

Within the terminal, execute the following:

.. code::

    python --version

.. figure:: ../images/installation/check_python_version_macos.png
    :alt:


If the command returns you have a Python version is 3.6 or higher, you can go to the :ref:`next-section <next section>`.

However, if the command returns a Python version lower than 3.6, or a message like ``'python' is not recognized as an internal or external command, operable program or batch file.``, you will still have to install a more recent version of Python.

To install a recent version of Python, we recommend to install Miniconda. Miniconda offers a user-friendly Python environment.


.. |miniconda| raw:: html

   <a href="https://docs.conda.io/en/latest/miniconda.html#macosx-installers" target="_blank">the Miniconda website</a>

.. figure:: ../images/installation/miniconda.png
    :alt:

Download the macOS version from |miniconda| and follow the default installation instructions. After installing Miniconda, make sure to close and reopen your Terminal, and again execute:

.. code::

    python --version

to check if Python has been properly installed. If your Python version is now 3.6.x or higher, you can proceed to :ref:`install-asr-unix <the next section>`.

.. _install-asr-unix:


2. Install ASReview (Unix)
~~~~~~~~~~~~~~~~~~~~~~~~~~
If your Python version is 3.6+, you can start installing the ASReview
software on your computer. Execute the following in the Terminal:

.. code::

    pip install asreview

If ASReview was installed succesfully, this command should return a bunch of text of which the last line is something like:

.. code::

    Successfully installed asreview-0.9.6

*Note: if you run into an error at this step, try executing `python -m pip install asreview` instead. If this doesn't fix your problems, please consult :ref:`_the Troubleshooting section <the Troubleshooting section>`.*

If you want to use our `COVID-19 plugin <covid-19.html>`__, you can install it at this step by executing:

.. code::

    pip install asreview-covid19

The plugin will be available automatically upon launching ASReview.

3. Launch ASReview (Unix)
~~~~~~~~~~~~~~~~~~~~~~~~~
Congratulations! You are now ready to start using ASReview.
Launch ASReview by executing in the Terminal:

.. code::

    asreview oracle

A web browser will open the ASReview user interface. Please follow the steps in our |quicktour| on how to carry out your first Automated Systematic Review!

--------------------------------------------------------------------------------



Upgrade ASReview
----------------

You can upgrade to newer versions of the ASReview software with

.. code::

    pip install --upgrade asreview


If you want to upgrade to a newer version of the COVID-19 plugin, use:

.. code::

    pip install --upgrade asreview-covid19


Server installation
-------------------

Although ASReview should only be used in closed networks, it is possible to
run on a server or custom domain. Use the command line arguments `ip` and
`port` for configuration.

.. code::

    asreview oracle --port 5555 --ip xxx.x.x.xx


.. _The-troubleshooting-section:

Troubleshooting
---------------

The following section describes familiar errors and how to solve them.
If this information does not solve your error, please let us know by filing |location link| (or, if you do not have a GitHub account, send us an e-mail at asreview@uu.nl)

.. |location_link| raw:: html

   <a href="https://github.com/asreview/asreview/issues" target="_blank">an issue in our GitHub repository</a>

Unknown command "pip" on command line or terminal
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you get one of the following errors:

.. code::

  -bash: pip: No such file or directory

.. code::

  'pip' is not recognized as an internal or external command, operable program or batch file.

Most likely, the environment variables aren't configured correctly. There are
tutorials on the internet to deal with this. However, a simple way to deal
with this is adding `python -m` in front of the command. For example:


.. code::

  python -m pip install asreview

Unknown command "asreview" on command line or terminal
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In some situations, the entry point "asreview" can not be found after installation.
First check whether the package is correctly installed. Do this with the command
`python -m asreview -h`. If this shows a decription of the program, please use
`python -m` in front of all your commands. For example:


.. code-block::

  python -m asreview oracle


No module named 'pip'
~~~~~~~~~~~~~~~~~~~~~
When installing or upgrading ASReview, it can occur that you run into the following warning:

.. code-block::

    WARNING: You are using pip version 19.2.3, however version 20.1.1 is available.
    You should consider upgrading via the 'python -m pip install --upgrade pip' command.

Or even run into error ``No module named 'pip'``:

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

.. code::

    python3 -m venv asreview/env
    source ~/asreview/env/bin/activate

Install and run `asreview` in the virtual environment.

.. code::

    pip install asreview
    asreview oracle

For more details on creating a virtual environment, please have a look at
https://docs.python.org/3/library/venv.html.
