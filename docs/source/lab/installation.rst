Installation
============

Install ASReview LAB
---------------------

ASReview LAB requires Python 3.10 or later. Detailed step-by-step instructions for
installing Python and ASReview LAB are available for `Windows
<https://asreview.ai/download>`__ and `macOS/Linux
<https://asreview.ai/download/>`__ users.

To install ASReview LAB using Pip, run the following command in `CMD.exe` (Windows)
or `Terminal` (macOS/Linux):

.. code:: bash

    pip install asreview

To start the application, use this command in `CMD.exe` or `Terminal`:

.. code:: bash

    asreview lab

The ASReview LAB application will open in your browser. For more options to
start ASReview LAB, see :doc:`start`.

.. note::

    Refer to :doc:`troubleshooting` for solutions to common installation issues.


Upgrade ASReview LAB
---------------------

To upgrade ASReview LAB, run:

.. code:: bash

    pip install --upgrade asreview


Uninstall ASReview LAB
-----------------------

To uninstall ASReview LAB, run:

.. code:: bash

    pip uninstall asreview

When prompted, enter ``y`` to confirm.

.. warning::

    Uninstalling ASReview LAB does not delete your project files. These files are
    stored in the `.asreview` folder in your home directory.


Server Installation
-------------------

You can run ASReview LAB on a server or custom domain. Use the `ip` and `port` flags
for configuration. ASReview LAB should only be used in closed networks.

.. code:: bash

    asreview lab --port 5555 --ip xxx.x.x.xx

.. warning::

    For use in production, we recommend to follow the
    :doc:`../server/installation` instructions of ASReview LAB Server.


Install with Docker
-------------------

ASReview LAB is also available as a Docker container. Ensure Docker is installed on
your machine.

To install and start ASReview LAB at http://localhost:5000, run:

.. code:: bash

    docker run -p 5000:5000 ghcr.io/asreview/asreview:latest lab

You can pass advanced command-line options as follows:

.. code:: bash

    docker run -p 9000:9000 ghcr.io/asreview/asreview lab --port 9000

.. tip::

    ASReview LAB is now installed. Open ``http://localhost:5000`` in your web
    browser to get started.


Mount Local Volume
~~~~~~~~~~~~~~~~~~

To mount the container to your local project folder (or any other folder), use
the `-v` flag. Replace `path-to-your-folder` with the path to your local folder.
When a project folder is specified, ASReview LAB will store and load all
projects from this folder. Multiple containers can access the same folder.

.. code:: bash

    docker run -p 5000:5000 -v path-to-your-folder:/project_folder
    ghcr.io/asreview/asreview lab


Named Container
~~~~~~~~~~~~~~~

To simplify usage, create a named container:

.. code:: bash

    docker create --name asreview-lab -p 5000:5000 -v
    path-to-your-folder:/project_folder ghcr.io/asreview/asreview lab

To start ASReview LAB, run:

.. code:: bash

    docker start asreview

To stop it, replace `start` with `stop`. You can check running containers with
`docker ps`.


Customize the Image
~~~~~~~~~~~~~~~~~~~

To add extensions or build the Docker image yourself, modify the `Dockerfile
<https://github.com/asreview/asreview/blob/main/Dockerfile>`__. After making
changes, build and run the image with:

.. code:: bash

    docker build -t asreview/asreview:custom . docker run -p 5000:5000
    ghcr.io/asreview/asreview:custom lab
