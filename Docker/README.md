# Building ASReview in Docker containers

This folder contains two recipes to build the ASReview in a Docker container. The `simple` folder lists a single Dockerfile that builds a simple, non authenticated version of the ASReview app. If you choose to create this container, and multiple people would like to use it, the app will be globally shared amongst all of them. This version makes more sense as a standalone app on your own computer.

The `auth_verified` folder creates a more complicated version that allows multiple users to access the app and create their own private projects. It requires users to signup and signin in order to access the app.

## Building the simple version

Creating the docker container for a simple, non-authenticated version of the app is done with the following commands:

```
$ docker build -t asreview -f ./Docker/simple/Dockerfile .
$ docker run -d 127.0.0.1:8081:5000 asreview
```

## Building the authenticated, verified version

Create the containers with docker compose:

```
$ docker compose -f docker-compose.yml up --build
```