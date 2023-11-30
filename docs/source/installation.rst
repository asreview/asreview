Installation
============

Welcome to the ASReview installation guide. Set up ASReview on your preferred
platform and begin your AI-aided systematic review with ease.

For local installation details, see the . For Docker deployment instructions, refer to
the :ref:`Docker Installation <docker-installation>` section. Consult
the  section for server
deployment guidelines. Each installation method offers full feature support
across Windows, macOS, and Linux platforms.


.. _python-installation:

Python
------
ASReview requires Python 3.8 or later. Follow these
step-by-step instructions to install the latest version of `Python <https://www.python.org/downloads/>`__.

To verify your Python installation, open a command prompt or terminal and type

.. code:: bash

    python --version

This command will display the installed version.

Note that installation steps may differ slightly based on your operating
system. Ensure you select the option to add Python to your PATH if prompted
during the installation process on Windows. This will make it possible to run
Python from any command line interface.

.. tip::

    Refer to the :doc:`Troubleshooting <troubleshooting>` section for guidance on common problems and their solutions.


Install
-------

Install the ASReview software with Pip, the Python package installer, by executing the following command in the
`Command Prompt` on Windows or `Terminal` on MacOS/Linux:

.. code:: bash

    pip install asreview

Once installed, start the application with:

.. code:: bash

    asreview lab

The ASReview LAB software will start in your web browser. For additional options on starting
ASReview LAB, refer to :doc:`start`.

.. tip::

        **Important Note on Data Backup**: When using ASReview in a local setup, your files are stored on your local machine. To safeguard your work against data loss due to hardware failure or other unforeseen events, we advise regularly :ref:`exporting<manage-export>` your project files (``.asreview`` files) and storing them in a secure, backed-up location. This practice ensures that your research can be recovered and continued from the last saved state, maintaining the integrity of your systematic review. 


Dependencies
~~~~~~~~~~~~

Certain advanced models in ASReview require additional dependencies. 

To install all optional dependencies at once, use the following command:

.. code:: bash

    pip install asreview[all]

Alternatively, you may install only the specific dependencies required for
particular models or features. For example, some feature extraction
techniques require TensorFlow. To install TensorFlow, run:

.. code:: bash

    pip install asreview[tensorflow] 

For detailed information about model-specific dependencies, refer to
the 'Models' section in the :doc:API Reference <api/models>.


Upgrade
~~~~~~~

To ensure you have the latest features and improvements, you can upgrade your
ASReview software to the newest version using the following command:

.. code:: bash

    pip install --upgrade asreview

It's recommended to periodically check for updates to maintain access to the
most recent enhancements and fixes.


Uninstall
~~~~~~~~~

To remove ASReview from your system, use the following command:

.. code:: bash

    pip uninstall asreview

When prompted, enter y to confirm the uninstallation.

.. warning::

    Uninstalling ASReview will **not** delete your project files. These are located in the `.asreview` directory within your home folder and must be removed manually if desired.



File Location
~~~~~~~~~~~~~

To determine the location where the `.asreview` files are stored on your system,
execute the following command:

.. code:: bash

    python -c "from asreview import asreview_path; print(asreview_path())"

.. tip::

    Regularly back up your `.asreview` project files to prevent data loss. Export your project files by following the instructions in the :ref:`manage-export` section and store them in a secure, backed-up location.


.. _docker-installation:

Install with Docker
-------------------

For a containerized version of ASReview, ensure that Docker is installed on
your system.

Run the following command to install and start ASReview LAB, accessible at
http://localhost:5000:

.. code:: bash

   docker run -p 5000:5000 ghcr.io/asreview/asreview:latest lab


To specify advanced options, such as changing the port, append command-line
arguments like so:

.. code:: bash

   docker run -p 9000:9000 ghcr.io/asreview/asreview lab --port 9000

ASReview LAB is now installed. Open the URL in your host web browser,
``http://localhost:5000``, and get started.


Mount local volume
~~~~~~~~~~~~~~~~~~

To persist data and facilitate easy access to project files, mount a local
directory to the container using the `-v` flag. Replace path-to-your-folder
with the desired local path. This allows ASReview LAB to store and retrieve
projects from the specified directory. It is also possible for multiple
containers to share access to this directory.

.. code:: bash

    docker run -p 5000:5000 -v path-to-your-folder:/project ghcr.io/asreview/asreview:latest lab

Named container
~~~~~~~~~~~~~~~

Creating a named container simplifies the management of your Docker workflow.
Set up a named container using the docker create command:

.. code:: bash

    docker create --name asreview-lab -p 5000:5000 -v path-to-your-folder:/project_folder ghcr.io/asreview/asreview lab

To start the ASReview LAB container, execute:

.. code:: bash

    docker start asreview

To stop it, replace `start` with `stop`. Monitor running containers with
`docker ps`.

Customize the image
~~~~~~~~~~~~~~~~~~~


For additional features or personal customization, modify the `Dockerfile` from the ASReview repository. After making changes, build your custom image and run it:

.. code:: bash

    docker build -t asreview/asreview:custom .
    docker run -p 5000:5000 asreview/asreview:custom lab

For adding more extensisons, or build the Docker image yourself, check the file `Dockerfile <https://github.com/ghcr.io/asreview/asreview/tree/master/Dockerfiles>`.



