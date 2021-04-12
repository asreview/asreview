# DEVELOPMENT

## Build project

Build the project from source with the following code.

	python setup.py compile_assets
	python setup.py sdist bdist_wheel

## Development workflow

### Back end
Install Python

Install the ASReview package

	pip install -e .

Start the Python API server with the Flask development environment

	export FLASK_ENV=development
	asreview lab
<<<<<<< HEAD
	
For Windows, use 
=======

For Windows, use

	set FLASK_ENV=development
	asreview lab

### Front end

Install both [npm][1] and Python

Start the Python API server with the Flask development environment. Before the front end development can be started, the back end has to run as well

	export FLASK_ENV=development
	asreview lab

For Windows, use
>>>>>>> 720fc44b05c368b7a01013f6180a1b20bed6cd09

	set FLASK_ENV=development
	asreview lab
	
### Front end

Install both [npm][1] and Python

Start the Python API server with the Flask development environment. Before the front end development can be started, the back end has to run as well

<<<<<<< HEAD
	export FLASK_ENV=development
	asreview lab
	
For Windows, use 

	set FLASK_ENV=development
	asreview lab

=======
>>>>>>> 720fc44b05c368b7a01013f6180a1b20bed6cd09
Navigate to `asreview/webapp` and install the front end application with npm

	cd asreview/webapp
	npm install

The user interface is written in [React][2]. Start the local front end application with npm

	npm start

Open the web browser at `localhost:3000`

**Important**: Ignore `localhost:5000`. You can also find a front end on `:5000` but this is not relevant for the current front end development step.
<<<<<<< HEAD
=======

Please make use of Prettier (https://prettier.io/docs/en/install.html) to
format React/Javascript code. Use the following code to format all files in
the webapp folder.

```
cd asreview/webapp
npx prettier --write .
```
>>>>>>> 720fc44b05c368b7a01013f6180a1b20bed6cd09

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

Open the file `docs/build/html/index.html` in your web browser.

### Screenshots

Screenshots are an important part of the ASReview documentation. When contributing screenshots,
follow the guidelines below.

1. Open Developers Tools in your browser (e.g. Chrome or Firefox).
2. Set device dimensions to **1280x800**.
3. Capture screenshot with internal screenshot tool (preferred, see [example](https://www.deconetwork.com/blog/how-to-take-full-webpage-screenshots-instantly/)).
4. [OPTIONAL] Crop relevant part. Keep ratio if possible.
5. Resize image to **1280x800** maximum and **960x600** minimum.
6. [OPTIONAL] Use a red box to highlight relevant components.
