# Building ASReview in Docker containers

This folder contains two recipes to build the ASReview in a Docker container. The `simple` folder lists a single Dockerfile that builds a simple, non authenticated version of the ASReview app. If you choose to create this container, and multiple people would like to use the app, it will be globally shared amongst all of them. This version makes more sense as a standalone app on your own computer.

The `auth_verified` folder creates a more complicated version that requires the user to signup and signin in order to access the app. Your projects are not accessible for other users. It makes sense if you run this version in the cloud or on a local server.

## Building the simple version

Creating the docker container for a 

## Building the authenticated, verified version

Create the containers with docker compose:

```
$ docker compose -f docker-compose.yml up --build
```