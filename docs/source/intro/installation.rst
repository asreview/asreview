Installation
============

Install ASReview
----------------

ASReview software requires having Python 3.7 or higher installed. Detailed
step-by-step instructions to install Python (and ASReview) are available for
`Windows <https://asreview.nl/download>`__ and
`MacOS <https://asreview.nl/download/>`__ users.

Install the ASReview software with Pip by running the following command in the
`CMD.exe` (Windows) or `Terminal` (MacOS/Linux):

.. code:: bash

    pip install asreview

Start the application with the following command (in CMD.exe or Terminal):

.. code:: bash

    asreview lab

You are now ready to start your first Automated Systematic Review!

See `Troubleshooting`_ for common problems.



Upgrade ASReview
----------------

Upgrade ASReview software with

.. code:: bash

    pip install --upgrade asreview



Uninstall ASReview
------------------

Remove ASReview with

.. code:: bash

    pip uninstall asreview

Enter ``y`` to confirm.

.. warning::

    Note that your project files will **not** delete with this action. You find them in the `.asreview` folder in your home folder.

Server Installation
-------------------

It is possible to run the ASReview software on a server or custom domain. Use
the flags `ip` and `port` for configuration. ASReview should only be used in
closed networks.

.. code:: bash

    asreview lab --port 5555 --ip xxx.x.x.xx

.. warning::

    Don't use the development server in production. Read the Flask documentation
    about `deploying a Flask app to production <https://flask.palletsprojects.com/en/1.1.x/tutorial/deploy/>`__.


Install with Docker
-------------------

For a quickstart of ASReview LAB using Docker and without the need to
install anything else, the latest version of the ASReview LAB can be
started as well via Docker like this:

.. code:: bash

   docker run -p 5000:5000 asreview/asreview

This will start the ASReview LAB server on port 5000 with default
command line options and make it accessible to the host at
http://localhost:5000 More advanced command line options can be given
afterwards, like this:

.. code:: bash

   docker run -p 9000:9000 asreview/asreview  --port 9000

For more information, see `the GitHub page <https://github.com/asreview/asreview/tree/master/docker>`__.
