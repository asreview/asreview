# DEVELOPMENT

## Build project

Build the project from source with the following code.

```
python setup.py compile_assets
python setup.py sdist bdist_wheel
```

## Development workflow

Install both [npm](https://www.npmjs.com/get-npm) and Python. 

Install the ASReview package (in a different terminal)

```
pip install -e .
```

Start the Python API server

```
export FLASK_ENV=development
asreview oracle
```

The user interface is written in [React](https://reactjs.org/). First, start a development server with npm. This serves is used for React development. Navigate to `asreview/webapp` and start npm.

```
cd asreview/webapp
npm start
```



Open the webbrowser at `localhost:3000`. **Important**: ignore `localhost:5000` for front-end development. 
