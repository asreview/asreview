Installation
============

.. note::

  Migrating from ASReview version 1 to version 2? Follow the :doc:`migration`
  guide.

ASReview LAB Server is a web application that allows you to run ASReview LAB on
your own server. It is designed to be easy to install and configure, and
provides the same functionality as the ASReview LAB application with extra
features like user authentication and crowd screening.

The software can be installed in a similar way as ASReview LAB. However, for
production environments, we recommend using `ASReview Server Stack
<https://github.com/asreview/asreview-server-stack>`_. This is a Docker Compose
setup that packages the main components of ASReview—such as the AI engine (task
server), the React front end, reverse proxy server, and a database layer—into
separate, containerized services.

Prerequisites
-------------

- Docker and Docker Compose installed on your server. See the `Docker
  installation instructions <https://docs.docker.com/get-started/get-docker/>`_.
- A server with sufficient resources to run the ASReview LAB application and
  database. We recommend at least 8 GB of RAM and 4 CPU cores for a production
  environment.
- A domain name or IP address for your server. This is required for the reverse
  proxy configuration.

Optional

- Git installed on your server so that you can clone the ASReview Server Stack
  repository from GitHub. If you don't have Git installed, you can download the
  repository as a ZIP file and extract it to your server.
- A valid SSL certificate for your domain name. This is required for secure
  communication between the server and the client. You can use Let's Encrypt to
  obtain a free SSL certificate.
- A PostgreSQL database. You can use the PostgreSQL database provided by the
  ASReview Server Stack, or you can use your own PostgreSQL database. If you use
  your own database, make sure to configure the connection settings in the
  :doc:`configuration` file.

Deploy to production
--------------------

To deploy ASReview LAB Server to production, follow these steps:

1. Clone the ASReview Server Stack repository from GitHub::

    git clone git@github.com:asreview/asreview-server-stack.git

2. Change to the ASReview Server Stack directory::

    cd asreview-server-stack

3. Configure the environment file if needed. In the `.env` file, you find
   parameters of the Docker Compose file only::

    nano .env

4. Edit the `asreview_config.toml` file to configure the ASReview LAB
   application. You can use the example configuration file provided in the
   repository as a starting point.

5. Change the secrets in the `asreview_config.toml` file. The secrets are used
   to encrypt sensitive data, such as password salt and the session key. You can
   use the `openssl` command to generate a random secret key:

   .. code-block:: none

      openssl rand -hex 32

SSL Configuration
-----------------

For secure communication, it is recommended to use SSL (Secure Sockets Layer)
for your ASReview LAB Server. This ensures that all data transmitted between the
server and the client is encrypted and secure. SSL is especially important if
you are handling sensitive data, such as user credentials or personal
information.

.. note::

  This documentation is not fully ready yet. For an example of SSL
  configuration, please refer to the `ASReview Server Stack repository
  <https://github.com/asreview/asreview-server-stack>`_.

.. To enable SSL for secure communication, follow these steps:

.. 1. Obtain an SSL certificate for your domain. You can use a free service like
..    `Let's Encrypt <https://letsencrypt.org/>`_ or purchase one from a trusted
..    certificate authority.

.. 2. Place the SSL certificate and private key files on your server. For example:
..    - `fullchain.pem`: The full certificate chain.
..    - `privkey.pem`: The private key.

.. 3. Update the `.env` file in the ASReview Server Stack directory to include the
..    paths to your SSL certificate and key files. Add the following variables:

..    - `ASREVIEW_SERVER_SSL_CERT`: Path to the SSL certificate file (e.g.,
..      `/path/to/fullchain.pem`).
..    - `ASREVIEW_SERVER_SSL_KEY`: Path to the SSL private key file (e.g.,
..      `/path/to/privkey.pem`).

.. 4. Ensure that the `ASREVIEW_SERVER_SSL_PORT` variable in the `.env` file is
..    set to the desired port for SSL communication (default is `443`).

.. 5. Restart the ASReview Server Stack to apply the changes:

..     docker-compose down
..     docker-compose up -d

.. Your ASReview LAB Server should now be accessible over HTTPS using the domain
.. name configured in your SSL certificate.

PostgreSQL database
-------------------

You can replace the SQLite database used for authentication with a `PostgreSQL
database <https://www.postgresql.org/>`_. This requires an extra step during
installation and an extra step in the configuration file:

1. Install the `psycopg2 <https://www.psycopg.org/docs/>`_ package. At the time
   of this writing, two versions of this package exist: ``psycopg2`` and
   ``psycopg2-binary``. According to the `documentation
   <https://www.psycopg.org/docs/install.html#quick-install>`_, the binary
   version works on most operating systems. You can skip this step if you use
   the Docker image provided by the ASReview Server Stack.
2. Then add the ``SQLALCHEMY_DATABASE_URI`` key to the config file:

.. code-block:: none

    SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://username:password@host:port/database_name"
