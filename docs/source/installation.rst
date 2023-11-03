Installation
============

There are three options for installing ASReview:

1. Local
2. Docker
3. Server

TABLE WITH OVERVIEW PROs AND CONS


Python
------
All the ASReview software requires an installation of Python 3.8 or later.
Step-by-step instructions to install Python (and ASReview) are available for
`Windows <https://asreview.ai/download>`__ and `macOS/Linux
<https://asreview.ai/download/>`__ users. 


Local Installaton
-----------------

EXPLAIN BENEFITS OF LOCAL INSTALLATION
EXPLAIN LOCAL DISADVANTAGE, NAMELY FILES ARE STORED LOCALLY

Install
~~~~~~~

Install the ASReview software with Pip by running the following command in the
`Command Prompt` (Windows) or `Terminal` (MacOS/Linux):

.. code:: bash

    pip install asreview

Start the application with the following command (in CMD.exe or Terminal):

.. code:: bash

    asreview lab

The ASReview LAB software starts in the browser. For more options on starting
ASReview LAB, see :doc:`start`.

.. note::

    See :doc:`troubleshooting` for common problems during installation.

.. tip::

    For users with Apple M1 computers, if you experience problems, follow the
    `instructions
    <https://github.com/ghcr.io/asreview/asreview/issues/738#issuecomment-919685562>`__.


Dependencies
~~~~~~~~~~~~

Some models require additional dependencies to be installed. Use pip install
asreview[all] to install all additional dependencies at once or check the
installation instruction in section Models of the API Reference.

For example, some feature extraction technique requires tensorflow to be installed. Use 

.. code:: bash

    pip install tensorflow 

or install all optional ASReview dependencies with 

.. code:: bash

    pip install asreview[all]


Upgrade
~~~~~~~

Upgrade ASReview software with

.. code:: bash

    pip install --upgrade asreview



Uninstall
~~~~~~~~~

Remove ASReview with

.. code:: bash

    pip uninstall asreview

Enter ``y`` to confirm.

.. warning::

    Note that your project files will **not** delete with this action. You find them in the `.asreview` folder in your home folder.


File Location
~~~~~~~~~~~~~

To obtain the location where the `.asreview` files are stored, use

.. code:: bash

    asreview.asreview_path()

.. tip::

    We recommend making regular back-ups of your projects by exporting [ADD LINK] the `.asreview` and saving it on a location which is back-uped


Install with Docker
-------------------

ASReview is also available as a Docker container. Make sure you have
Docker installed on your machine.

To install and start ASReview LAB at http://localhost:5000, run the following:

.. code:: bash

   docker run -p 5000:5000 ghcr.io/asreview/asreview:latest lab


More advanced command line options can be given
afterward, like this:

.. code:: bash

   docker run -p 9000:9000 ghcr.io/asreview/asreview lab --port 9000

.. tip::

    ASReview LAB is now installed. Open the URL in your host web browser:
    ``http://localhost:5000`` and get started.


Mount local volume
~~~~~~~~~~~~~~~~~~

To mount the container to your local project folder (or any other local
folder), the `-v` flag can be used. To do so, adjust path-to-your-folder to
your local folder. When a project folder is specified, ASReview LAB will store
and load all its projects from this folder. Note that multiple containers can
access the same folder.

.. code:: bash

    docker run -p 5000:5000 -v path-to-your-folder:/project_folder ghcr.io/asreview/asreview lab

Named container
~~~~~~~~~~~~~~~

To make the usage easier, you can create a named container like the following:

.. code:: bash

    docker create --name asreview-lab -p 5000:5000 -v path-to-your-folder:/project_folder ghcr.io/asreview/asreview lab

To start asreview, enter:

.. code:: bash

    docker start asreview

To stop it, just use `stop` instead of `start`.
You can also check which images are running with `docker ps`.

Customize the image
~~~~~~~~~~~~~~~~~~~

If you want to add more extensions, or build the Docker image yourself, check the file `Dockerfile <https://github.com/ghcr.io/asreview/asreview/tree/master/Dockerfiles>`.
Modify it as you see fit, and then build and run the image with:

.. code:: bash

    docker build -t asreview/asreview:custom .
    docker run -p 5000:5000 ghcr.io/asreview/asreview:custom lab



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