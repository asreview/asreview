Installation
============

ASReview LAB Server is a web application that allows you to run ASReview LAB on
your own server. It is designed to be easy to install and configure, and
provides the same functionality as the ASReview LAB application with extra
features like user authentication and crowd screening.

The software can be installed in a similar was as ASReview LAB. However, for
production environments, we recommend using ASReview Server Stack. This is a
Docker Compose set-up that packages the main components of ASReview—such as the
AI engine (task server), the React front-end, reverse proxy server, and a
database layer—into separate, containerized services.

Preruisities
------------

- Docker and Docker Compose installed on your server. See the `Docker
  installation instructions <https://docs.docker.com/get-docker/>`_.
- A server with sufficient resources to run the ASReview LAB application and
  database. We recommend at least 8 GB of RAM and 4 CPU cores for a production
  environment.
- A domain name or IP address for your server. This is required for the reverse
  proxy configuration.


Optional

- Git installed on your server such that you can clone the ASReview Server Stack
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

3. Copy the example environment file to a new file::

    cp .env.example .env

4. Edit the `.env` file to configure the environment variables for your server.
   You can use the example environment file as a reference. Make sure to set
   the following variables:

   - `ASREVIEW_SERVER_HOST`: The host name or IP address of your server.
   - `ASREVIEW_SERVER_PORT`: The port number for the ASReview LAB Server
     application. Default is `80`.
   - `ASREVIEW_SERVER_SSL_PORT`: The port number for the ASReview LAB Server
     application with SSL. Default is `443`.
   - `ASREVIEW_SERVER_DB_URL`: The URL for the PostgreSQL database. Default is
     `postgresql://postgres:password@db:5432/asreview`.
   - `ASREVIEW_SERVER_DB_NAME`: The name of the PostgreSQL database. Default is
     `asreview`.
   - `ASREVIEW_SERVER_DB_USER`: The username for the PostgreSQL database.
     Default is `postgres`.
   - `ASREVIEW_SERVER_DB_PASSWORD`: The password for the PostgreSQL database.
     Default is `password`.

SSL Configuration
-----------------

To enable SSL for secure communication, follow these steps:

1. Obtain an SSL certificate for your domain. You can use a free service like
   `Let's Encrypt <https://letsencrypt.org/>`_ or purchase one from a trusted
   certificate authority.

2. Place the SSL certificate and private key files on your server. For example:
   - `fullchain.pem`: The full certificate chain.
   - `privkey.pem`: The private key.

3. Update the `.env` file in the ASReview Server Stack directory to include the
   paths to your SSL certificate and key files. Add the following variables:

   - `ASREVIEW_SERVER_SSL_CERT`: Path to the SSL certificate file (e.g.,
     `/path/to/fullchain.pem`).
   - `ASREVIEW_SERVER_SSL_KEY`: Path to the SSL private key file (e.g.,
     `/path/to/privkey.pem`).

4. Ensure that the `ASREVIEW_SERVER_SSL_PORT` variable in the `.env` file is
   set to the desired port for SSL communication (default is `443`).

5. Restart the ASReview Server Stack to apply the changes::

    docker-compose down
    docker-compose up -d

Your ASReview LAB Server should now be accessible over HTTPS using the domain
name configured in your SSL certificate.
