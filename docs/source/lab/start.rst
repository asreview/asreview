Start ASReview LAB
==================

After you install ASReview LAB, start the program via the command line to
start using it.

.. code:: bash

	asreview lab

When you are using Windows, open `CMD.exe` and run the command. When you use
MacOS or Linux, you can open `Terminal` and run the command.

The information in the sections below is more advanced and not needed for the
majority of the ASReview LAB users.

Command line arguments for starting ASReview LAB
------------------------------------------------

ASReview LAB provides a powerful command line interface for running ASReview
LAB with other options or even run tasks like simulations. For a list of
available commands in ASReview LAB, type :code:`asreview lab --help`.

:program:`asreview lab` launches the ASReview LAB software (the frontend).

.. code:: bash

   asreview lab [options]



.. program:: asreview lab

.. option:: -h, --help

	Show help message and exit.

.. option:: --ip IP

    The IP address the server will listen on.

.. option:: --port PORT

	The port the server will listen on.

.. option:: --port-retries NUMBER_RETRIES

	The number of additional ports to try if the specified port is not
        available.

.. option:: --enable-auth ENABLE_AUTH

	Enable authentication. Deprecated.

.. option:: --secret-key SECRET_KEY

	Secret key for authentication. Deprecated.

.. option:: --salt SALT

	When using authentication, a salt code is needed for hasing passwords.

.. option:: --config-path CONFIG_PATH

    Path to a TOML file containing ASReview parameters.

.. option:: --no-browser NO_BROWSER

	Do not open ASReview LAB in a browser after startup.

.. option:: --certfile CERTFILE_FULL_PATH

    The full path to an SSL/TLS certificate file.

.. option:: --keyfile KEYFILE_FULL_PATH

    The full path to a private key file for usage with SSL/TLS.

.. option:: --embedding EMBEDDING_FP

    File path of embedding matrix. Required for LSTM models.

.. option:: --clean-project CLEAN_PROJECT

    Safe cleanup of temporary files in project.

.. option:: --clean-all-projects CLEAN_ALL_PROJECTS

    Safe cleanup of temporary files in all projects.

.. option:: --seed SEED

	Seed for the model (classifiers, balance strategies, feature extraction
	techniques, and query strategies). Use an integer between 0 and 2^32 - 1.


Set environment variables
-------------------------

The following environment variables are available.

.. option:: ASREVIEW_PATH

	The path to the folder with project. Default `~/.asreview`.


How you set environment variables depends on the operating system and the
environment in which you deploy ASReview LAB.

In MacOS or Linux operating systems, you can set environment variables from the command
line. For example:

.. code:: bash

    export ASREVIEW_PATH=~/.asreview

On Windows, you can use the following syntax:

.. code:: bash

	set ASREVIEW_PATH=~/.asreview

To check if you set an environment variable successfully, run the following on \*nix operating systems:

.. code:: bash

	echo $ASREVIEW_PATH

Or the following on Windows operating systems:

.. code:: bash

	echo %ASREVIEW_PATH%


Run ASReview LAB on localhost with a different port
---------------------------------------------------

By default, ASReview LAB runs on port 5000. If that port is already in use or
if you want to specify a different port, start ASReview LAB with the following
command:

.. code:: bash

	asreview lab --port <port>

For example, start ASReview LAB on port 5001:

.. code:: bash

	asreview lab --port 5001
