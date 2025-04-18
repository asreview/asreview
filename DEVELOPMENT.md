# DEVELOPMENT

## Development workflow for frontend and backend development

Most users will only need the first 2 steps: Installation and Setting Up Servers.

### Installation

Install Python and [Node.js](https://nodejs.org/en) (we use Node v20).

Install ASReview in editable mode

```sh
pip install -e ".[dev]"
```

Navigate into `asreview/webapp` and install NPM packages (with clean-install)

```sh
cd asreview/webapp
npm ci
```

### Setting up servers

The best development workflow for the ASReview frontend and backend makes use
of 3 simultanously running servers:

1. A Python server with the the Flask app.
2. A Python server for a task manager that manages running models after records
   are labeled.
3. A Node server for the frontend.

Open a command line interface (e.g. Terminal or CMD.exe) and navigate to
`asreview/webapp`. Start the Flask app with

```sh
cd asreview/webapp
flask run --debug
```

Next, open a second command line interface and run:

```sh
asreview task-manager
```

This starts the task manager (by default on `localhost`, port 5101). Use the
`--verbose` flag to view logging messages.

Next, open a third command line interface and navigate to `asreview/webapp`.
Start the local front end application running on a Node server.

```sh
cd asreview/webapp
npm start
```

The webbrowser opens at `localhost:3000`. Every time you edit one of the
webapp related Python or Javascript files, the application will automatically
refresh in the browser.

#### Visual Studio Code task

Users of Visual Studio Code can set up servers easily by configuring a task
([ASReview Development `tasks.json` on GitHub
gist](https://gist.github.com/J535D165/9dd94fec840115c844059658904f7607)).

Use the task `startASReviewDevServer` to start the development servers. This
task enables authentication by default. Use `startASReviewDevServer_NoAuth` for
the non-authenticated version.

#### Authentication

ASReview LAB can be configured with authentication without. As developer, you
can change the configuration as follows:

- Use the Visual Studio Code Task (Recommended)
- Create a file `.env.development.local` with environment variable
  `REACT_APP_AUTHENTICATION=true`. Start the Node server (`npm start`) as usual.
  Start the Flask server with an extra environment vairable
  `ASREVIEW_LAB_AUTHENTICATION=true flask run --debug`

#### Advanced config

Create an TOML config file and set the environment variable
`ASREVIEW_LAB_CONFIG_PATH` to the local config file. Start the application again

```sh
cd asreview/webapp
ASREVIEW_LAB_CONFIG_PATH=my_config.toml flask run --debug
```

### Advanced

#### Port and CORS configuration

In development, when working on the front end, the front- and backend are
strictly separated. It is assumed the Flask app runs on port 5000 and the
React front end on port 3000. Deviating from these ports will lead to
connection or CORS (Cross-Origin Resource Sharing) issues.

As for CORS issues: it is necessary to precisely define the "allowed origins"
in the backend. These origins must reflect the URL(s) used by the front end
to call the backend. If correctly configured, they are added to the headers
of the backend response, so they can be verified by your browser. If the list
with origin-URLs doesn't provide a URL that corresponds with the URL used in
the original request of the front end, your request is going to fail.

**Node server running on port other than 3000**

Set `ALLOWED_ORIGINS` to the url and port of the Node server. E.g., the server
runs on http://localhost:3010:

```sh
FLASK_ALLOWED_ORIGINS=http://localhost:3010 flask run --debug
```

You can also add `ALLOWED_ORIGINS` to your config file or set the environment
variable `FLASK_ALLOWED_ORIGINS`.

**Flask app running on port other than 5000**

Set `REACT_APP_API_URL` to the url and port of the Flask API server. E.g., the
server runs on http://localhost:5010:

```sh
REACT_APP_API_URL=http://localhost:5010 npm start
```

Alternative is to add this `REACT_APP_API_URL` to the `.env.development` file in the
`/asreview/webapp` folder. Override this config file with a local version
(e.g. `/asreview/webapp/.env.development.local`). More information https://create-react-app.dev/docs/adding-custom-environment-variables/#adding-development-environment-variables-in-env.

## Testing

### Git Submodules

The tests of ASReview make use of extra datasets available via submodules.
To clone the full repository with submodules in one line, add `--recursive` flag:

```
git clone --recursive git://github.com/asreview/asreview.git
```

## Formatting and linting

Use `ruff` to lint the Python code and `ruff format` to format the code.
Install the linters and formatters with:

```sh
pip install asreview[dev]
```

Run the following commands to lint and format:

```sh
ruff check .
ruff format .
```

For the React application, Prettier is used to format the files.
Install prettier by following the instructions at https://prettier.io/docs/en/install.html.

Run the formatter with

```
npx prettier --write .
```

There is also a `pre-commit` available to handle linting and formatting.

```
pre-commit install
```

## Documentation

### Sphinx docs

Documentation for the ASReview project is available on https://asreview.readthedocs.io/en/latest/.
The source files are available in the [`docs`](/docs) folder of this repository. The project makes
use of [Sphinx](https://www.sphinx-doc.org/) to convert the source files and docstrings into HTML
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
