# ASReview with Docker

## Quickstart using Docker

For a quickstart of ASReview LAB using Docker and without the need to install anything else,
the latest version of the ASReview LAB can be started as well via Docker like this:

 ```
 docker run -p 5000:5000 asreview/asreview
 ```

This will start the ASReview LAB server on port 5000 with default command line options and make it accessible to the host at http://localhost:5000
More advanced command line options can be given afterwards, like this:

 ```
 docker run -p 9000:9000 asreview/asreview --port 9000
 ```

## Running simulations from Docker

ASReview has as well a Docker image for the command line interface. It contains as well the other extensions: visualization, statistics, hyperopt, covid19

The entrypoint of this container is "asreview", so other parameters need to be appended.

```
docker run -ti asreview/asreview-cli -h
```

Then inside the container all normal asreview CLI commands can be executed. This requires very likely to mount a path from the host into Docker
in order to exchange data files between host and container. This gets done by adding the "-v" parameter accordingly to the docker run command.


## Tags

Use the tag `latest` for the latest released version and release-x.x.x for specific
released version. For Docker images based on the latest commit on the master branch,
use the tag `development`. 

For example:

```
docker run -p 9000:9000 asreview/asreview:development --port 9000
```
