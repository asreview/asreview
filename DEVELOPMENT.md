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

	pip install -e .

Start the Python API server with the Flask development environment

	export FLASK_DEBUG=1
	asreview lab

For Windows, use

	set FLASK_DEBUG=1
	asreview lab

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

Please make use of Prettier (https://prettier.io/docs/en/install.html) to
format React/Javascript code. Use the following code to format all files in
the webapp folder.

```
cd asreview/webapp
npx prettier --write .
```

[1]:	https://www.npmjs.com/get-npm
[2]:	https://reactjs.org/

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

To configure the authentication in more detail we need to create a JSON file
that contains all authentication parameters. The keys in that JSON file will override any parameter that was passed in the CLI. Here's an example:
```
{
    "DEBUG": true,
    "AUTHENTICATION_ENABLED": true,
    "SECRET_KEY": "<secret key>",
    "SECURITY_PASSWORD_SALT": "<salt>",
    "SESSION_COOKIE_SECURE": true,
    "REMEMBER_COOKIE_SECURE": true,
    "SESSION_COOKIE_SAMESITE": "Lax",
    "SQLALCHEMY_TRACK_MODIFICATIONS": true,
    "ALLOW_ACCOUNT_CREATION": true,
    "EMAIL_VERIFICATION": true,
    "EMAIL_CONFIG": {
        "SERVER": "<smtp-server>",
        "PORT": <smpt-server-port>,
        "USERNAME": "<smtp-server-username>",
        "PASSWORD": "<smtp-server-password>",
        "USE_TLS": false,
        "USE_SSL": true,
        "REPLY_ADDRESS": "<preferred reply email address>"
    },
    "OAUTH": {
        "GitHub": {
            "AUTHORIZATION_URL": "https://github.com/login/oauth/authorize",
            "TOKEN_URL": "https://github.com/login/oauth/access_token",
            "CLIENT_ID": "<GitHub client ID>",
            "CLIENT_SECRET": "<GitHub client secret>",
            "SCOPE": ""
        },
        "Orcid": {
            "AUTHORIZATION_URL": "https://sandbox.orcid.org/oauth/authorize",
            "TOKEN_URL": "https://sandbox.orcid.org/oauth/token",
            "CLIENT_ID": "<Orcid client ID>",
            "CLIENT_SECRET": "<Orcid client secret>",
            "SCOPE": "/authenticate"
        },
        "Google": {
            "AUTHORIZATION_URL": "https://accounts.google.com/o/oauth2/auth",
            "TOKEN_URL": "https://oauth2.googleapis.com/token",
            "CLIENT_ID": "<Google client ID>",
            "CLIENT_SECRET": "<Google client secret>",
            "SCOPE": "profile email"
        }
    }
}
```
Store the JSON file on the server and start the ASReview application from the CLI with the
`--flask-configfile` parameter:
```
$ python3 -m asreview lab --flask-configfile=<path-to-JSON-config-file>
```
A number of the keys in the JSON file are standard Flask parameters. The keys that are specific for authenticating ASReview 

pare summarised below:
*  AUTHENTICATION_ENABLED: if set to `true` the application will start with authentication enabled. If the SQLite database does not exist, one will be created during startup.
* SECRET_KEY: the secret key is a string that is used to encrypt cookies and is mandatory if authentication is required.
* SECURITY_PASSWORD_SALT: another string used to hash passwords, also mandatory if authentication is required.
* ALLOW_ACCOUNT_CREATION: enables account creation by users, either by front- or backend.
* EMAIL_VERIFICATION: used in conjunction with ALLOW_ACCOUNT_CREATION. If set to `true` the system sends a verification email after account creation. Only relevant if the account is __not__ created by OAuth. This parameter can be omitted if you don't want verification.
* EMAIL_CONFIG: configuration of the SMTP email server that is used for email verification. It also allows users to retrieve a new password after forgetting it. Don't forget to enter the reply address (REPLY_ADDRESS) of your system emails. Omit this parameter if system emails for verification and password retrieval are unwanted.
* OAUTH: an authenticated ASReview application may integrate with the OAuth functionality of Github, Orcid and Google. Provide the necessary OAuth login credentails (for [Github](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), [Orcid](https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/) en [Google](https://support.google.com/cloud/answer/6158849?hl=en)). Please note that the AUTHORIZATION_URL and TOKEN_URL of the Orcid entry are sandbox-urls, and thus not to be used in production. Omit this parameter if OAuth is unwanted.

### Converting an unauthenticated application in an authenticated one

At the moment there is a very basic tool to convert your unauthenticated ASReview application into an authenticated one. The following steps sketch a possible approach for the conversion:

1. In the ASReview folder (by default `~/.asreview`) you can find all projects that were created by users in the unauthenticated version. Every sub-folder contains a single project. Make sure you can link those projects to a certain user. In other words: make sure you know which project should be linked to which user.
2. Start the application, preferably with using the config JSON file and setting the ALLOW_ACCOUNT_CREATION to `true`.
3. Use the backend to create user accounts (done with a POST request to `/auth/signup`, see `/asreview/webapp/api/auth.py`). Make sure a full name is provided for every user account. Once done, one could restart the application with ALLOW_ACCOUNT_CREATION set to `False` if account creation by users is undesired.
4. Run the `auth_conversion.py` (root folder) script and follow instructions. The script iterates over all project folders in the ASReview folder and asks which user account has to be associated with it. The script will establish the connection in the SQlite database and rename the project folders accordingly.

TODO@Jonathan @Peter: I have verified this approach. It worked for me but
obviously needs more testing. I don't think it has to grow into a bombproof solution, but should be used as a stepping stone for an admin
with a little bit of Python knowledge who wants to upgrade to an authenticated version. Anyhow: give it a spin: create a couple of projects, rename the folders in the original project_ids and remove from the projects folder. The script should restore all information.

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

## EXPERIMENTAL: One Click Deploy for ASReview LAB

You can deploy ASReview LAB right now in one click on any of these clouds providers:

[<img src="https://aka.ms/deploytoazurebutton" height="30px">](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fasreview%2Fasreview%2Fmaster%2Fazuredeploy.json)
[<img src="https://deploy.cloud.run/button.svg" height="30px">](https://deploy.cloud.run)
[<img src="https://www.herokucdn.com/deploy/button.svg" height="30px">](https://heroku.com/deploy?template=https://github.com/asreview/asreview/tree/master)

❗❗❗ ASReview doesn't have builtin authentication. You are responsible for the authentication and security of the server yourself.


## Release instructions

### Docker

Creating a Docker release can't be done with a hook anymore (not for free). Find the manual instructions at
https://docs.docker.com/docker-hub/. Replace the version numbers below by the version you want to push.

ASReview LAB
```
docker build -t asreview/asreview docker/asreview-lab/.
docker build -t asreview/asreview:1.0 docker/asreview-lab/.
docker push asreview/asreview
docker push asreview/asreview:1.0
```


ASReview CLI
```
docker build -t asreview/asreview-cli docker/asreview-cli/.
docker build -t asreview/asreview-cli:1.0 docker/asreview-cli/.
docker push asreview/asreview-cli
docker push asreview/asreview-cli:1.0
```
