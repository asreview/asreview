Installation
============

Install ASReview
----------------

ASReview software requires an installation of Python 3.7 or later. Detailed
step-by-step instructions to install Python (and ASReview) are available for
`Windows <https://asreview.nl/download>`__ and
`macOS/Linux <https://asreview.nl/download/>`__ users.

Install the ASReview software with Pip by running the following command in the
`CMD.exe` (Windows) or `Terminal` (MacOS/Linux):

.. code:: bash

    pip install asreview

Start the application with the following command (in CMD.exe or Terminal):

.. code:: bash

    asreview lab

You are now ready to start your first Automated Systematic Review!

See :doc:`../intro/troubleshooting` for common problems during installation.



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

ASReview LAB is also available as a Docker container. Make sure you have Docker installed on your machine.

To install and start ASReview LAB at http://localhost:5000, run the following:

.. code:: bash

   docker run -p 5000:5000 asreview/asreview:latest


More advanced command line options can be given
afterwards, like this:

.. code:: bash

   docker run -p 9000:9000 asreview/asreview  --port 9000

.. tip::

    ASReview LAB is now installed. Open the URL in your host web browser:
    ``http://localhost:5000`` and get started.


Mount local volume
~~~~~~~~~~~~~~~~~~

To mount the container to your local project folder (or any other local folder), the `-v` flag can be used in the following way. Adjust path-to-your-folder to your local folder. When a project folder is specified, ASReview LAB will store and load all its projects from this folder. Note that multiple containers can access the same folder.

.. code:: bash

    docker create --name asreview-lab -p 5000:5000 -v path-to-your-folder:/project_folder asreview/asreview

Build a local image
~~~~~~~~~~~~~~~~~~~

For more information, see `ASReview LAB GitHub <https://github.com/asreview/asreview/tree/master/docker>`__.
