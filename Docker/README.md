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

For account verification, but also for the forgot-password feature, an email server is required. But maintaining an email server can be very demanding. If you would like to avoid it, a third-party service like might be [Sendgrid](https://sendgrid.com/) an good alternative. In this recipe we use the SMTP Relay Service from Sendgrid: every email send by the ASReview application will be relayed by this service. Sendgrid is for free if you don't expect the application to send more than 100 emails per day. Receiving reply emails from end-users is not possible if you use the Relay service, but that might be irrelevant.

In the `auth_verified` folder you find 6 files:
1. `asreview.conf` - a configuration files used by NGINX, the frontend server.
2. `docker-compose.yml` - the docker compose file that will create the Docker containers.
3. `Dockerfile_backend` - Dockerfile for the backend, installs all Python related software, including Gunicorn, and starts the backend server on port 5001.
4. `Dockerfile_frontend` - Dockerfile for the frontend, installs Node, the React frontend and NGINX and starts the NGINX server.
5. `flask_config.toml` - the configuration file for the ASReview application. Contains the necessary EMAIL_CONFIG parameters to link the application to the Sendgrid Relay Service.
6. `wsgi.py` - a tiny Python file that ensures we can serve the backend with Gunicorn.




We will use their  to send verification/password emails to our end-users. We don't expect email back. If you expect the system to send less than 100 emails per day, Sendgrid is for free.

Create the containers with docker compose:

```
$ docker compose -f docker-compose.yml up --build
```