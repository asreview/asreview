# DEVELOPMENT

## Build project

Build the project from source with the following code.

	python setup.py compile_assets
	python setup.py sdist bdist_wheel

## Development workflow

Install both [npm][1] and Python.

Install the ASReview package (in a different terminal)

	pip install -e .

Start the Python API server

	export FLASK_ENV=development
	asreview lab

Navigate to `asreview/webapp` and install npm.

	cd asreview/webapp
	npm install

The user interface is written in [React][2]. First, start a development server with npm. This serves is used for React development.

	npm start

Open the webbrowser at `localhost:3000`. **Important**: ignore `localhost:5000` for front-end development.

[1]:	https://www.npmjs.com/get-npm
[2]:	https://reactjs.org/

## Documentation

### Sphinx docs

Documentation for the ASReview project is available on https://asreview.readthedocs.io/en/latest/.
The source files are available in the [`docs`](/docs) folder of this repository. The project makes
use of [Sphinx](https://www.sphinx-doc.org/) to convert the source files and docstrings into HTML
or PDF files.

Install the dependcies for rendering the documenation with

```
pip install -r docs/requirements.txt
```

Navigate into the `docs` folder and render the documentation (the HTML version) with

```
make html
```

Open the file `docs/build/html/index.html` in your webbrowser.

### Screenshots

Screenshots are an important part of the ASReview documentation. When contributing screenshots,
follow the guidelines below.

1. Open Developers Tools in your browser (e.g. Chrome or Firefox).
2. Set device dimensions to **1280x800**.
3. Capture screenshot with internal screenshot tool (preferred, see [example](https://www.deconetwork.com/blog/how-to-take-full-webpage-screenshots-instantly/)).
4. [OPTIONAL] Crop relevant part. Keep ratio if possible.
5. Resize image to **1280x800** maximum and **960x600** minimum.
6. [OPTIONAL] Use a red box to highlight relevant components.
