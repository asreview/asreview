Docker
======

`Docker <https://docs.docker.com/get-docker/>`__ uses containers to create virtual
environments that isolate a ASReview LAB installation from the rest of the system.

ASReview LAB Docker requirements
--------------------------------

`Install Docker <https://docs.docker.com/get-docker/>`__ on your local `host` machine.

Download an ASReview LAB Docker image
-------------------------------------

The official ASReview LAB Docker images are located in the `asreview/asreview
<https://hub.docker.com/r/asreview/asreview>`__ Docker Hub repository.

Open `Terminal
<https://support.apple.com/guide/terminal/open-or-quit-terminal-apd5265185d-f365-44cb-8b09-71a064a42125/mac>`__
(macOS) or `Command Prompt
<https://www.lifewire.com/how-to-open-command-prompt-2618089>`__ (Windows) and enter:

.. code-block:: bash

    docker pull asreview/asreview  # latest stable release

Start an ASReview LAB Docker container
--------------------------------------

.. code-block:: bash

    docker run -p 5000:5000 asreview/asreview

.. tip::

    ASReview LAB is now installed. Open the URL in your host web browser:
    ``http://localhost:5000`` and get started.

For advanced usage, see the `GitHub page
<https://github.com/asreview/asreview/tree/master/docker>`__.
