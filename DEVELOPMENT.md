# DEVELOPMENT

## Build project

Build the project from source with the following code.

```
python setup.py compile_assets
python setup.py sdist bdist_wheel
```

## Development workflow

Install both npm and Python. 


Start the npm server for React development. Navigate to `asreview/webapp` and start npm.

```
cd asreview/webapp
npm start
```

Install the package (in a different terminal)

```
pip install .
```

Start the server
```
export FLASK_ENV=development
asreview oracle
```

Open the webbrowser at `localhost:3000`. Note, ignore `localhost:5000` for front-end development. 