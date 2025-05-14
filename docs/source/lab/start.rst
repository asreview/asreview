Start ASReview LAB
==================

After you install ASReview LAB, start the program via the command line to start
using it.

.. code:: bash

	asreview lab

When you are using Windows, open `CMD.exe` and run the command. When you use
MacOS or Linux, you can open `Terminal` and run the command.

Read the following sections for advanced options to start or configure ASReview
LAB users.

Command line arguments for starting ASReview LAB
------------------------------------------------

ASReview LAB provides a powerful command line interface for running ASReview LAB
with other options or even run tasks like simulations. For a list of available
commands in ASReview LAB, type :code:`asreview lab --help`.

:program:`asreview lab` launches the ASReview LAB software (the frontend).

.. code:: bash

   asreview lab [options]



.. program:: asreview lab

.. option:: -h, --help

	Show help message and exit.

.. option:: --host HOST

    The host/IP address the server will listen on.

.. option:: --port PORT

	The port the server will listen on.

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

.. option:: --port-retries NUMBER_RETRIES

	The number of additional ports to try if the specified port is not
        available.

.. option:: --certfile CERTFILE_FULL_PATH

    The full path to an SSL/TLS certificate file.

.. option:: --keyfile KEYFILE_FULL_PATH

    The full path to a private key file for usage with SSL/TLS.

.. option:: --skip-update-check

	Skip checking for updates.


Set environment variables
-------------------------

The following environment variables are available.

.. option:: ASREVIEW_PATH

	The path to the folder with project. Default `~/.asreview`.


How you set environment variables depends on the operating system and the
environment in which you deploy ASReview LAB.

In MacOS or Linux operating systems, you can set environment variables from the
command line. For example:

.. code:: bash

    export ASREVIEW_PATH=~/.asreview

On Windows, you can use the following syntax:

.. code:: bash

	set ASREVIEW_PATH=~/.asreview

To check if you set an environment variable successfully, run the following on
\*nix operating systems:

.. code:: bash

	echo $ASREVIEW_PATH

Or the following on Windows operating systems:

.. code:: bash

	echo %ASREVIEW_PATH%


Run ASReview LAB on localhost with a different port
---------------------------------------------------

By default, ASReview LAB runs on port 5000. If that port is already in use or if
you want to specify a different port, start ASReview LAB with the following
command:

.. code:: bash

	asreview lab --port <port>

For example, start ASReview LAB on port 5001:

.. code:: bash

	asreview lab --port 5001



Local server with authentication
--------------------------------

.. note:: For production use, it is recommended to use the Docker setup. See the
   :doc:`../server/overview` section for more information.

The most basic configuration of the ASReview LAB application with authentication
is to run the application from the CLI with the ``--enable-auth`` flag. The
application will start with authentication enabled and will create a SQLite
database if it does not exist. The database will be stored in the ASReview
projects folder. The database contains the user accounts and links them to
projects.

Start the application with authentication enabled:

.. code:: bash

    asreview lab --enable-auth --secret-key=<secret key> --salt=<salt>

where ``--enable-auth`` forces the application to run in an authenticated mode,
``<secret key>`` is a string that is used for encrypting cookies and ``<salt>``
is a string that is used to hash passwords. The ``--secret-key`` and ``--salt``
parameters are mandatory if authentication is required.

To create user accounts, one can use the ``add-users`` command of the
``auth-tool`` sub command of the ASReview application:

.. code:: bash

    asreview auth-tool add-users

For more information about auth-tool and creating users, see the section
`Create user accounts <#create-user-accounts-with-auth-tool>`_ below.
