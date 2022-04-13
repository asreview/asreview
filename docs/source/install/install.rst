Install ASReview LAB
====================

ASReview LAB is supported on Windows, macOS, and Linux.

Download a package
------------------

Install ASReview LAB with Python's `pip` package manager.

.. code-block:: bash

    pip install asreview

Read the :doc:`pip install guide <pip>`.

Run an ASReview LAB container
-----------------------------

The `ASReview LAB Docker images <https://hub.docker.com/r/asreview/asreview>`__ are
already configured to run ASReview LAB. A `Docker
<https://docs.docker.com/get-docker/>`__ container runs in a virtual environment.

.. code-block:: bash

    docker run -p 5000:5000 asreview/asreview  # Download and start Docker container

Read the :doc:`Docker install guide <docker>`.

Install and run on a server
---------------------------

To run ASReview LAB on a server or custom domain, follow the :doc:`pip install guide
<pip>` and use the flags ``ip`` and ``port`` for configuration.

.. important::

    ASReview LAB must be used in closed networks.

.. code-block:: bash

    asreview lab --port 5555 --ip IP_ADDRESS

.. warning::

    Don't use the development server in production. Read more about `deploying a Flask
    app to production <https://flask.palletsprojects.com/en/1.1.x/tutorial/deploy/>`__.
