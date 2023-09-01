# Building ASReview in Docker containers

This folder contains two recipes to build different versions of the ASReview application in a Docker container. The `simple` folder lists a single Dockerfile that builds a simple, non authenticated version of the ASReview app. If you choose to create this container, and multiple people would like to use it, the app will be globally shared amongst all of them. This version makes more sense as a standalone app on your own computer for individual use.

The `auth_verified` folder creates an authenticated version that allows multiple users to access the app and create their own private projects. It requires users to signup and signin in order to access the app.

## Building the simple version

Creating the docker container for a simple, non-authenticated version of the app is done with the following commands (run these commands from the __root__ folder of the app to ensure the correct context):

```
$ docker build -t asreview -f ./Docker/simple/Dockerfile .
$ docker run -d -p 8080:5000 asreview
```

with port 8080 being a suggestion. After the last command you find the app in your browser at `http://localhost:8080`.

## Building the authenticated, verified version

If you would like to setup the ASReview application as a shared service, a more complicated container setup is required. A common, robust setup for a Flask/React application is to use [NGINX](https://www.nginx.com/) to serve the frontend, and [Gunicorn](https://gunicorn.org/) to serve the backend. We build separate containers for both front- and backend with [docker-compose](https://docs.docker.com/compose/).

For account verification, but also for the forgot-password feature, an email server is required. But maintaining an email server can be very demanding. If you would like to avoid it, a third-party service like [SendGrid](https://sendgrid.com/) might be a good alternative. In this recipe we use the SMTP Relay Service from Sendgrid: every email sent by the ASReview application will be relayed by this service. Sendgrid is for free if you don't expect the application to send more than 100 emails per day. Receiving reply emails from end-users is not possible if you use the Relay service, but that might be irrelevant.

In the `auth_verified` folder you find 7 files:
1. `.env` - An environment variable file for Docker compose, initializes all internal and external container ports.
2. `asreview.conf` - a configuration files used by NGINX, the frontend server.
3. `docker-compose.yml` - the docker compose file that will create the Docker containers.
4. `Dockerfile_backend` - Dockerfile for the backend, installs all Python related software, including Gunicorn, and starts the backend server on port 5001.
5. `Dockerfile_frontend` - Dockerfile for the frontend, installs Node, the React frontend and NGINX and starts the NGINX server.
6. `flask_config.toml` - the configuration file for the ASReview application. Contains the necessary EMAIL_CONFIG parameters to link the application to the Sendgrid Relay Service.
7. `wsgi.py` - a tiny Python file that serves the backend with Gunicorn.

### SendGrid

If you would like to use or try out [SendGrid](https://sendgrid.com/), go to their website, create an account and sign in. Once signed in, click on "Email API" in the menu and subsequently click on the "Integration Guide" link. Then, choose "SMTP Relay", create an API key and copy the resulting settings (Server, Ports, Username and Password) in your `flask_config.toml` file. It's important to continue with checking the "I've updated my settings" checkbox when it's visible __and__ to click on the "Next: verify Integration" button before you build the Docker containers.

### Gunicorn and NGINX workers

As written, the backend is served by Gunicorn. Gunicorn spawns a number of child processes called workers that handle incoming HTTP requests. The amount of workers is configurable in the `Dockerfile_backend` above the ENTRYPOINT command where a Gunicorn configuration file is created. This number is set to the amount of cores your server has plus 1, but change this if desired. Changing the amount of NGINX workers is possible, but requires more configuration which we will ignore.

### Ports

The preferred port mapping of your Docker containers is configured in the `.env` file. There are 2 containers, a frontend and a backend container. In the `.env` both internal and external ports are defined with descriptive variable names.

### Creating and running the containers

From the __root__ folder of the app execute the `docker compose` command:

```
$ docker compose -f ./Docker/auth_verified/docker-compose.yml up --build --force-recreate
```