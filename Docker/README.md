# Building ASReview in Docker containers

This folder contains two recipes to build different versions of the ASReview application in a Docker container. The `simple` folder lists a single Dockerfile that builds a simple, non authenticated version of the ASReview app. If you choose to create this container, and multiple people would like to use it, the app will be globally shared amongst all of them. This version makes more sense as a standalone app on your own computer.

The `auth_verified` folder creates an authenticated version that allows multiple users to access the app and create their own private projects. It requires users to signup and signin in order to access the app.

## Building the simple version

Creating the docker container for a simple, non-authenticated version of the app is done with the following commands (run these commands from the root folder of the app to ensure the correct context):

```
$ docker build -t asreview -f ./Docker/simple/Dockerfile .
$ docker run -d -p 8081:5000 asreview
```

After the last command you can find the app if you browse to `http://localhost:8081`.

## Building the authenticated, verified version

If you would like to setup the ASReview application as a shared service a more complicated container setup is required. We would like to use more configurable, robust servers for both frontend and backend. A well-known setup is to use Gunicorn as a backend server and NGINX to serve the frontend.

Another setup item to consider is an email service. It would be wise to have your users confirm their accounts by email and it allows people to reset their passwords in case they are forgotten. But setting up a full blown email server can be difficult and may cause a lot of security issues. In this recipe we outsource the email service to a third-party service called [Sendgrid](https://sendgrid.com/). We will use their SMTP Relay Service to send verification/password emails to our end-users. We don't expect email back. If you expect the system to send less than 100 emails per day, Sendgrid is for free.

Create the containers with docker compose:

```
$ docker compose -f docker-compose.yml up --build
```