# DEVELOPMENT

## Build project

Build the project from source with the following code.

	python setup.py compile_assets
	python setup.py sdist bdist_wheel

## Development workflow

### Git Submodules
Some demo datasets are included as a submodule. Directory [asreview/tests/citation-file-formatting](https://github.com/ottomattas/asreview/tree/development-v1/tests) is cloned from [citation-file-formatting](https://github.com/asreview/citation-file-formatting).

Examples:
- To clone the full repository with submodules in one line, add `--recursive` flag:

	```git clone --recursive git://github.com/asreview/asreview.git```

- To update the submodule, you would still need to follow the contribution guide in the submodule repository. And then create a PR for the main repository with the updated submodule commit.

### Back end

Install Python

Install the ASReview package

```
pip install -e .[dev]
```

Start the Python API server with the Flask development environment

```
export FLASK_DEBUG=1
asreview lab
```

For Windows, use

```
set FLASK_DEBUG=1
asreview lab
```

#### Formatting and linting

Use `flake8` to lint the Python code and format the code with `black`. Use
`black[jupyter]` if you are editing the Jupyter notebooks. Use `isort` to
sort the imports.

Install the linters and formatters with:

```sh
pip install black[jupyter] flake8 flake8-isort isort
```

Run the following commands to lint and format:

```sh
black .
isort .
flake8 .
```

### Front end
The user interface is written in [React](https://reactjs.org/). 


Please make use of [npx](https://www.npmjs.com/package/npx) and Prettier
(https://prettier.io/docs/en/install.html) to format React/Javascript code.
Afer installing `npx` and `prettier`, navigate to the folder with the file
you want to 'prettify' and run:

```
npx prettier --write .
```

To run a local version of the front-end on `localhost:3000`, proceed as
follows:

1. You need to install [Node.js](https://nodejs.org/en) for local development (we use version 20).

2. Before the front end development can be started, the back end has to run as well. Therefore, first, start the Python API server with the Flask development environment: 

```
export FLASK_DEBUG=1
asreview lab
```

For Windows, use

```
set FLASK_DEBUG=1
asreview lab
```

Note, when working with PowerShell use

```
$env:FLASK_DEBUG = "1"
asreview lab
```

**Important**: Ignore `localhost:5000`, because this is not relevant for the
  development version, which will run on `localhost:3000`.

3. Next, open a new CLI and navigate to `asreview/webapp` and install the front end application with [npm](https://www.npmjs.com/get-npm):

```
cd asreview/webapp
npm install
```

Start the local front end application with npm

```
npm start
```

4. Open the web browser at `localhost:3000`

### Front end development and connection/CORS issues

In development, when working on the front end, the front- and backend are strictly separated. It is assumed the Flask backend runs on port 5000 and the React front end on port 3000. Deviating from these ports will lead to connection or CORS (Cross-Origin Resource Sharing) issues.

As for CORS issues: it is necessary to precisely define the "allowed origins" in the backend. These origins must reflect the URL(s) used by the front end to call the backend. If correctly configured, they are added to the headers of the backend response, so they can be verified by your browser. If the list with origin-URLs doesn't provide a URL that corresponds with the URL used in the original request of the front end, your request is going to fail. __Setting the allowed origins can be done in the [config file](#full-configuration)__.

You can solve connection/CORS issues by doing the following:
1. Start the backend and verify what port number it's running on (read the first lines of the output once you've started the backend in the terminal).
2. Make sure the front end knows where it can find the backend. React reads a configuration `.env` file in the `/asreview/webapp` folder which tells it to use `http://localhost:5000/`. Override this config file by either adding a local version (e.g. `/asreview/webapp/.env.local`) in which you put the correct backend URL (do not forget the `REACT_APP_API_URL` variable, see the `.env` file) or change the URL in the `.env` file itself.
3. If you are running the front end separate from the backend you need to adjust the CORS's 'allowed origins' parameter in the backend to avoid problems. You can do this by setting the front end URL(s) in the [optional parameters of the config file](#optional-config-parameters) under the "ALLOWED_ORIGINS" key.

Be precise when it comes to URLs/port numbers! In the context of CORS `localhost` is different from `127.0.0.1`, although they are normally referring to the same host.

❗Mac users beware: depending on your version of macOS you may experience troubles with `localhost:5000`. Port 5000 may be in use by "Airplay Receiver" which may (!) cause nondeterministic behavior. If you experience similar issues [switch to a different port](#optional-config-parameters).


## Documentation

### Sphinx docs

Documentation for the ASReview project is available on https://asreview.readthedocs.io/en/latest/.
The source files are available in the [`docs`](/docs) folder of this repository. The project makes
use of [Sphinx](https://www.sphinx-doc.org/en/master/usage/installation.html) to convert the source files and docstrings into HTML
or PDF files.

Install the dependencies for rendering the documentation with

```
pip install .[docs]
```

Navigate into the `docs` folder and render the documentation (the HTML version) with

```
make html
```

Open the file `docs/build/html/index.html` in your web browser.

### Broken links

Navigate into the `docs` folder and check for broken links with:

```
make linkcheck
```

Extra information: https://www.writethedocs.org/guide/tools/testing/#link-testing

### Screenshots

Screenshots are an important part of the ASReview documentation. When contributing screenshots,
follow the guidelines below.

1. Open Developers Tools in your browser (e.g. Chrome or Firefox).
2. Set device dimensions to **1280x800**.
3. Capture screenshot with internal screenshot tool (preferred, see [example](https://www.deconetwork.com/blog/how-to-take-full-webpage-screenshots-instantly/)).
4. [OPTIONAL] Crop relevant part. Keep ratio if possible.
5. Resize image to **1280x800** maximum and **960x600** minimum.
6. [OPTIONAL] Use a red box to highlight relevant components.


## Release instructions

### Docker

A Docker image is created when a tag or a commit to `master` is pushed.
The workflow `docker.yml` builds images for platforms `linux/amd64` and `linux/arm64`.
If, for some reason, the image is not built, you can build manually with the commands below.
Find the manual instructions at <https://docs.docker.com/docker-hub/> and <https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry>.
Replace the version numbers below by the version you want to push.

ASReview LAB
```
docker build -t asreview/asreview .
docker build -t asreview/asreview:1.0 .
docker push ghcr.io/asreview/asreview
docker push ghcr.io/asreview/asreview:1.0
```

If you are creating a Docker container that runs the app with a [config file](#full-configuration) do __not forget__ to override the IP-address of the Flask backend. Set the HOST variable to "0.0.0.0" since the default "localhost" can't be reached from outside the container.

See the `Docker` folder for more information about running the ASReview app in Docker containers.
