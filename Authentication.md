## Authentication

It is possible to run ASReview with authentication, enabling multiple users to run their
projects in their own separate workspaces. Authentication requires the storage of user
accounts and link these accounts to projects. Currently we are using a small SQLite 
database (asreview.development.sqlite or asreview.production.sqlite) in the ASReview 
folder to store that information.

Note that it is possible to run the authenticated application with a 
[Postgresql database](https://www.postgresql.org/). Using Postgresql requires 2 extra 
installation steps:
1. Install the [psycopg2](https://www.psycopg.org/docs/) package. At the time of this writing
2 versions of this package exist: `psycopg2` and `psycopg2-binary`. According to the
[documentation](https://www.psycopg.org/docs/install.html#quick-install) the binary 
version works on most operating systems.
2. Use the [configuration file](#full-configuration) to setup the connection 
between the application and the database.

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

Do you want to use a Postgresql database? Then add the `SQLALCHEMY_DATABASE_URI` key to the config file:

```toml
SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://username:password@host:port/database_name"
```

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
