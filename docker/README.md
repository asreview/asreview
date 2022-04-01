# ASReview with Docker

## Quickstart using Docker
If you have docker installed, you can run ASReview with Docker.

For a quickstart of ASReview LAB, the latest version of the ASReview LAB can be started as via
Docker like this:

 ```
 docker run -p 5000:5000 asreview/asreview
 ```

This will start the ASReview LAB server on port 5000 with default command line
options and make it accessible to the host at http://localhost:5000

A special command line interface image is available as `asreview/asreview-cli`.
Make sure to use the -ti flag to start the image in interactive mode.


## Advanced usage

Docker is a very powerful tool for running software in a container, and many
different options are available to customize the behavior of the container.

To create a container for ASReview LAB and name the container, you can use the
following command:

```
docker create --name asreview-lab -p 5000:5000 asreview/asreview
```

To run this container, use the following command:

```
docker start asreview-lab
```

To use a specific image of ASReview LAB, in this case `asreview:0.19`, you can
use the following command. For a list of available versions, visit the
[dockerhub page](https://hub.docker.com/r/asreview/asreview/tags/).

```
docker create --name asreview-lab -p 5000:5000 asreview/asreview:0.19
```

To run multiple containers of asreview LAB at the same time, a new port has to be
specified for each container. Adjust the host port to the port you want to use.
```
docker create --name asreview-0.19 -p 5019:5000 asreview/asreview:0.19
docker create --name asreview-0.17.1 -p 5017:5000 asreview/asreview:release-0.17.1
```

Advanced command line options can be given after the image, like this:
```
docker create --name asreview-lab -p 5000:5000 asreview/asreview --seed 12345
```

### Connect to the local project folder

To attach the container to your local project folder (or any other local
folder), the -v flag can be used in the following way. Adjust
`path-to-your-folder` to your local folder. When a project folder is specified,
ASReview LAB will store and load all its projects from this folder.

```
docker create --name asreview-lab -p 5000:5000 -v path-to-your-folder:/project_folder asreview/asreview
```

### Build your own image

If you want to use a specific version of ASReview LAB, not available as
DockerHub image, you can build your own. To build your own image, create a file
called `Dockerfile` (so no file extension!) and fill it with the following code.
In this example, ASReview version `1.0rc0` was used.

```
FROM python:3.8
RUN pip install asreview==1.0rc0
ENTRYPOINT ["asreview","lab","--ip","0.0.0.0"]
ENV ASREVIEW_PATH=project_folder
```
To build an image from this file, use the following command from the same
directory as the dockerfile is in:

```
docker build -t asreview:1.0rc0 .
```

After the image was build, it can be used for a container just like the
DockerHub images.
```
docker create --name asreview-lab -p 5000:5000 asreview:1.0rc0
```