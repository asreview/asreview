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

	pip install -e .[dev]

Start the Python API server with the Flask development environment

	export FLASK_DEBUG=1
	asreview lab

For Windows, use

	set FLASK_DEBUG=1
	asreview lab

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

Install both [npm][1] and Python

Start the Python API server with the Flask development environment. Before the front end development can be started, the back end has to run as well

	export FLASK_DEBUG=1
	asreview lab

For Windows, use

	set FLASK_DEBUG=1
	asreview lab

Navigate to `asreview/webapp` and install the front end application with npm

	cd asreview/webapp
	npm install

The user interface is written in [React][2]. Start the local front end application with npm

	npm start

Open the web browser at `localhost:3000`

**Important**: Ignore `localhost:5000`. You can also find a front end on `:5000` but this is not relevant for the current front end development step.

[1]:	https://www.npmjs.com/get-npm
[2]:	https://reactjs.org/

### Front end development and connection/CORS issues

In development, when working on the front end, the front- and backend are strictly separated. It is assumed the Flask backend runs on port 5000 and the React front end on port 3000. Deviating from these ports will lead to connection or CORS (Cross-Origin Resource Sharing) issues.

As for CORS issues: it is necessary to precisely define the "allowed origins" in the backend. These origins must reflect the URL(s) used by the front end to call the backend. If correctly configured, they are added to the headers of the backend response, so they can be verified by your browser. If the list with origin-URLs doesn't provide a URL that corresponds with the URL used in the original request of the front end, your request is going to fail. __Setting the allowed origins can be done in the [config file](#full-configuration)__.

You can solve connection/CORS issues by doing the following:
1. Start the backend and verify what port number it's running on (read the first lines of the output once you've started the backend in the terminal).
2. Make sure the front end knows where it can find the backend. React reads a configuration `.env` file in the `/asreview/webapp` folder which tells it to use `http://localhost:5000/`. Override this config file by either adding a local version (e.g. `/asreview/webapp/.env.local`) in which you put the correct backend URL (do not forget the `REACT_APP_API_URL` variable, see the `.env` file) or change the URL in the `.env` file itself.
3. If you are running the front end separate from the backend you need to adjust the CORS's 'allowed origins' parameter in the backend to avoid problems. You can do this by setting the front end URL(s) in the [optional parameters of the config file](#optional-config-parameters) under the "ALLOWED_ORIGINS" key.

Be precise when it comes to URLs/port numbers! In the context of CORS `localhost` is different from `127.0.0.1`, although they are normally referring to the same host.

❗Mac users beware: depending on your version of macOS you may experience troubles with `localhost:5000`. Port 5000 may be in use by "Airplay Receiver" which may (!) cause nondeterministic behavior. If you experience similar issues [switch to a different port](#optional-config-parameters).

#### Formatting and linting

Please make use of Prettier (https://prettier.io/docs/en/install.html) to
format React/Javascript code. Use the following code to format all files in
the webapp folder.

```
cd asreview/webapp
npx prettier --write .
```

## Authentication

It is possible to run ASReview with authentication, enabling multiple users to run their
projects in their own separate workspaces. Authentication requires the storage of user
accounts and link these accounts to projects. Currently we are using a small SQLite 
database (asreview.development.sqlite or asreview.production.sqlite) in the ASReview 
folder to store that information.

### Bare bones authentication

Using authentication imposes more configuration. Let's start with running a bare bones
authenticated version of the application from the CLI:
```
$ python3 -m asreview lab --enable-auth --secret-key=<secret key> --salt=<salt>
```
where `--enable-auth` forces the application to run in an authenticated mode, 
`<secret key>` is a string that is used for encrypting cookies and `<salt>` is
a string that is used to hash passwords.

This bare bones application only allows an administrator to create user accounts by 
editing the database without the use of the ASReview application! To facilitate this,
one could use the User model that can be found in `/asreview/webapp/authentication/models.py`. Note that with this simple configuration it is not possible for a user to change forgotten passwords without the assistance of the administrator.

### Full configuration

To configure the authentication in more detail we need to create a TOML file that contains all authentication parameters. The parameters in that TOML file will override parameters that were passed in the CLI. Here's an example:
```toml
DEBUG = true
AUTHENTICATION_ENABLED = true
SECRET_KEY = "<secret key>"
SECURITY_PASSWORD_SALT = "<salt>"
SESSION_COOKIE_SECURE = true
REMEMBER_COOKIE_SECURE = true
SESSION_COOKIE_SAMESITE = "Lax"
SQLALCHEMY_TRACK_MODIFICATIONS = true
ALLOW_ACCOUNT_CREATION = true
ALLOW_TEAMS = false
EMAIL_VERIFICATION = false

[EMAIL_CONFIG]
SERVER = "<smtp-server>"
PORT = 465
USERNAME = "<smtp-server-username>"
PASSWORD = "<smtp-server-password>"
USE_TLS = false
USE_SSL = true
REPLY_ADDRESS = "<preferred reply email address>"

[OAUTH]
        [OAUTH.GitHub]
        AUTHORIZATION_URL = "https://github.com/login/oauth/authorize"
        TOKEN_URL = "https://github.com/login/oauth/access_token"
        CLIENT_ID = "<GitHub client ID>"
        CLIENT_SECRET = "<GitHub client secret>"
        SCOPE = ""
    
        [OAUTH.Orcid]
        AUTHORIZATION_URL = "https://sandbox.orcid.org/oauth/authorize"
        TOKEN_URL = "https://sandbox.orcid.org/oauth/token"
        CLIENT_ID = "<Orcid client ID>"
        CLIENT_SECRET = "<Orcid client secret>"
        SCOPE = "/authenticate"

        [OAUTH.Google]
        AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/auth"
        TOKEN_URL = "https://oauth2.googleapis.com/token"
        CLIENT_ID = "<Google client ID>"
        CLIENT_SECRET = "<Google client secret>"
        SCOPE = "profile email"
```
Store the TOML file on the server and start the ASReview application from the CLI with the
`--flask-configfile` parameter:
```
$ python3 -m asreview lab --flask-configfile=<path-to-TOML-config-file>
```
A number of the keys in the TOML file are standard Flask parameters. The keys that are specific for authenticating ASReview are summarised below:
*  AUTHENTICATION_ENABLED: if set to `true` the application will start with authentication enabled. If the SQLite database does not exist, one will be created during startup.
* SECRET_KEY: the secret key is a string that is used to encrypt cookies and is mandatory if authentication is required.
* SECURITY_PASSWORD_SALT: another string used to hash passwords, also mandatory if authentication is required.
* ALLOW_ACCOUNT_CREATION: enables account creation by users, either by front- or backend.
* EMAIL_VERIFICATION: used in conjunction with ALLOW_ACCOUNT_CREATION. If set to `true` the system sends a verification email after account creation. Only relevant if the account is __not__ created by OAuth. This parameter can be omitted if you don't want verification.
* EMAIL_CONFIG: configuration of the SMTP email server that is used for email verification. It also allows users to retrieve a new password after forgetting it. Don't forget to enter the reply address (REPLY_ADDRESS) of your system emails. Omit this parameter if system emails for verification and password retrieval are unwanted.
* OAUTH: an authenticated ASReview application may integrate with the OAuth functionality of Github, Orcid and Google. Provide the necessary OAuth login credentails (for [Github](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), [Orcid](https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/) en [Google](https://support.google.com/cloud/answer/6158849?hl=en)). Please note that the AUTHORIZATION_URL and TOKEN_URL of the Orcid entry are sandbox-urls, and thus not to be used in production. Omit this parameter if OAuth is unwanted.

#### Optional config parameters

There are three optional parameters available that control what address the ASReview server listens to, and avoid CORS issues:

```toml
HOST = "0.0.0.0"
PORT = 5001
ALLOWED_ORIGINS = ["http://localhost:3000"]
```
The HOST and PORT determine what address the ASReview server listens to. If this deviates from `localhost` and port 5000, and you run the front end separately, make sure the [front end can find the backend](#front-end-development-and-connectioncors-issues). The ALLOWED_ORIGINS key must be set if you run the front end separately. Put in a list all URLs that your front end uses. This can be more than one URL. Failing to do so will certainly lead to CORS issues.

### Converting an unauthenticated application into an authenticated one

Start the application with authentication enabled for the first time. This ensures the creation of the necessary database. To avoid unwanted user input, shutdown the application.

To convert the old unauthenticated projects into authenticated ones, the following steps should be taken:

1. Create user accounts for people to sign in.
2. Convert project data and link the projects to the owner's user account.

Under the CLI sub commands of the ASReview application a tool can be found that facilitates these procedures:

```
$ asreview auth-tool --help
```

#### Creating user accounts

The first step is to create user accounts. This can be done interactively or by using a JSON string to bulk insert the accounts. To add user accounts interactively run the following command:
```
$ asreview auth-tool add-users --db-path ~/.asreview/asreview.production.sqlite
```

Note that the absolute path of the sqlite database has to be provided. Also note that if your app runs in development mode, use the `asreview.development.sqlite` database instead. The tool will prompt you if you would like to add a user account. Type `Y` to continue and enter an email address, name, affiliation (not required) and a password for every person. Continue to add as many users as you would like.

If you would like to bulk insert user accounts use the `--json` option:
```
$ asreview auth-tool add-users -j "[{\"email\": \"name@email.org\", \"name\": \"Name of User\", \"affiliation\": \"Some Place\", \"password\": \"1234@ABcd\"}]" --db-path ~/.asreview/asreview.production.sqlite
```
The JSON string represents a Python list with a dictionary for every user account with the following keys: `email`, `name`, `affiliation` and `password`. Note that passwords require at least one symbol. These symbols, such as the exclamation mark, may compromise the integrity of the JSON string.

#### Preparing the projects

After creating the user accounts, the existing projects must be stored and linked to a user account in the database. The tool provides the `list-projects` command to prepare for this step in case you would like to bulk store all projects. Ignore the following commands if you prefer to store all projects interactively. 

Without a flag, the command lists all projects:
```
$ asreview auth-tool list-projects
```
If you add the `--json` flag:
```
$ asreview auth-tool list-projects --json
```
the tool returns a convenient JSON string that can be used to bulk insert and link projects into the database. The string represents a Python list containing a dictionary for every project. Since the ID of the user account of 
the owner is initially unknown, the `0` behind every `owner_id` key needs to be replaced with the appropriate owner ID. That ID number can be found if we list all user accounts with the following command:
```
$ asreview auth-tool list-users --db-path ~/.asreview/asreview.production.sqlite
```

#### Inserting and linking the projects into the database

Inserting and linking the projects into the database can be done interactively:
```
$ asreview auth-tool link-projects --db-path ~/.asreview/asreview.production.sqlite
```
The tool will list project by project and asks what the ID of the owner is. That ID can be found in the user list below the project information.

One can also insert all project information by using the JSON string that was produced in the previous step:
```
$ asreview auth-tool link-projects --json "[{\"folder\": \"project-id\", \"version\": \"1.1+51.g0ebdb0c.dirty\", \"project_id\": \"project-id\", \"name\": \"project 1\", \"authors\": \"Authors\", \"created\": \"2023-04-12 21:23:28.625859\", \"owner_id\": 15}]" --db-path ~/.asreview/asreview.production.sqlite
``` 

## Documentation

### Sphinx docs

Documentation for the ASReview project is available on https://asreview.readthedocs.io/en/latest/.
The source files are available in the [`docs`](/docs) folder of this repository. The project makes
use of [Sphinx](https://www.sphinx-doc.org/) to convert the source files and docstrings into HTML
or PDF files.

Install the dependencies for rendering the documentation with

```
pip install -r docs/requirements.txt
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
