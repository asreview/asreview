# Building ASReview in Docker containers

This folder contains two recipes to build different versions of the ASReview application in a Docker container. The root folder lists a single Dockerfile that builds a simple, non authenticated version of the ASReview app. If you choose to create this container, and multiple people would like to use it, the app will be globally shared amongst all of them. This version makes more sense as a standalone app on your own computer for individual use.

The `auth_verified` folder creates an authenticated version that allows multiple users to access the app and create their own private projects. It requires users to signup and signin in order to access the app.

## Building the simple version

Creating the docker container for a simple, non-authenticated version of the app is done with the following commands (run these commands from the __root__ folder of the app to ensure the correct context):

```
# create a volume
$ docker volume create asreview_simple
# build the container
$ docker build  -t asreview .
# run container
$ docker run -d -v asreview_simple_volume:/project_folder -p 8080:5000 asreview
```

with the external port 8080 being a suggestion. After the last command you find the app in your browser at `http://localhost:8080`.

If you are creating a Docker container that runs the app with a config file, do __not forget__ to override the IP-address of the Flask backend. Set the HOST variable to "0.0.0.0" since the default "localhost" can't be reached from outside the container.

## Building the authenticated, verified version

If you would like to setup the ASReview application as a shared service, a more complicated container setup is required. A common, robust, setup for a Flask/React application is to use [NGINX](https://www.nginx.com/) to serve the frontend, and [Gunicorn](https://gunicorn.org/) to serve the backend. We build separate containers for a database (used for user accounts), and both front- and backend with [docker-compose](https://docs.docker.com/compose/).

For account verification, but also for the forgot-password feature, an email server is required. But maintaining an email server can be demanding. If you would like to avoid it, a third-party service like [SendGrid](https://sendgrid.com/) might be a good alternative. In this recipe we use the SMTP Relay Service from Sendgrid: every email sent by the ASReview application will be relayed by this service. Sendgrid is for free if you don't expect the application to send more than 100 emails per day. Receiving reply emails from end-users is not possible if you use the Relay service, but that might be irrelevant.

In the `auth_verified` folder you find 7 files:
1. `.env` - An environment variable file for all relevant (secret) parameters (ports, database, email and Gunicorn related parameters)
2. `asreview.conf` - a configuration files used by NGINX.
3. `docker-compose.yml` - the docker compose file that will create the Docker containers.
4. `Dockerfile_backend` - Dockerfile for the backend, installs all Python related software, including Gunicorn, and starts the backend server.
5. `Dockerfile_frontend` - Dockerfile for the frontend, installs Node, the React frontend and NGINX and starts the NGINX server.
6. `flask_config.toml` - the configuration file for the ASReview application. Contains the necessary email configuration parameters to link the application to the Sendgrid Relay Service.
7. `wsgi.py` - a tiny Python file that serves the backend with Gunicorn.

### SendGrid

If you would like to use or try out [SendGrid](https://sendgrid.com/), go to their website, create an account and sign in. Once signed in, click on "Email API" in the menu and subsequently click on the "Integration Guide" link. Then, choose "SMTP Relay", create an API key and copy the resulting settings (Server, Ports, Username and Password) in your `flask_config.toml` file. It's important to continue with checking the "I've updated my settings" checkbox when it's visible __and__ to click on the "Next: verify Integration" button before you build the Docker containers.

### Parameters in the .env file

The .env file contains all necessary parameters to deploy all containers. All variables that end with the `_PORT` suffix refer to the internal and external network ports of the containers. The prefix of these variable explains for which container they are used. Note that the external port of the frontend container, the container that will be directly used by the end-user, is 8080, and not 80. Change this into 80 if you dont want to use port numbers in the URL of the ASReview web application.

The `FLASK_MAIL_PASSWORD` refers to the password provided by the SendGrid Relay service, and the value of the `WORKERS` parameter determines how many instances of the ASReview app Gunicorn will start.

All variables that start with the `POSTGRES` postfix are meant for the PostgreSQL database. The `_USER`, `_PASSWORD` variables are self-explanatory. the `_DB` variable determines the name of the database.

### Creating and running the containers

From the __root__ folder of the app execute the `docker compose` command:

```
$ docker compose -f ./Docker/auth_verified/docker-compose.yml up --build
```

### Short explanation of the docker-compose workflow

Building the database container is straightforward, there is no Dockerfile involved. The container spins up a PostgreSQL database, protected by the username and password values in the `.env` file. The backend container depends on the database container to ensure the backend can only start when the database exists.

The frontend container uses a multi-stage Dockerfile. The first phase builds the React frontend and copies it to the second phase which deploys a simple NGINX container. The `asreview.conf` file is used to configure NGINX to serve the frontend.

The backend container is more complicated. It also uses a multi-stage Dockerfile. In the first stage all necessary Python/PostgreSQL related software is installed and the app is build. The app is copied into the second stage. Within the second stage the `flask_config.toml` file is copied into the container and all missing parameters (database-uri and email password) are adjusted according to the values in the `.env` file. The path of this Flask configuration file will be communicated to the Flask app by an environment variable.\
Then a Gunicorn config file (`gunicorn.conf.py`) is created on the fly which sets the server port and the preferred amount of workers. After that a second file is created: an executable shell script that instructs the ASReview app to create the necessary tables in the database and start the Gunicorn server using the configuration described in the previous file.

Note that a user of this recipe only has to change the necessary values in the `.env` file and execute the `docker compose` command to spin up an ASReview service, without an encrypted HTTP protocol!
 