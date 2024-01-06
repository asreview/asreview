Server configuration
--------------------

ASReview LAB offers a number of options to run the application on a server. It
is possible to run the application on a server with or without authentication.
The latter is the default option. This page describes how to configure the
ASReview LAB application to run on a server with authentication enabled. With
authentication enabled, users can to run their projects in their own separate
workspaces. Authentication requires the storage of user accounts and link these
accounts to projects. Currently we are using a SQLite database
(asreview.development.sqlite or asreview.production.sqlite) in the ASReview
projects folder to store that information.

Bare bones authentication
~~~~~~~~~~~~~~~~~~~~~~~~~

The most basic configuration of the ASReview application with authentication is
to run the application from the CLI with the ``--enable-auth`` flag. The
application will start with authentication enabled and will create a SQLite
database if it does not exist. The database will be stored in the ASReview
projects folder. The database contains the user accounts and links them to
projects.

Start the application with authentication enabled:

.. code:: bash

    asreview lab --enable-auth --secret-key=<secret key> --salt=<salt>

where ``--enable-auth`` forces the application to run in an authenticated mode,
``<secret key>`` is a string that is used for encrypting cookies and ``<salt>``
is a string that is used to hash passwords. The ``--secret-key`` and ``--salt``
parameters are mandatory if authentication is required.

To create user accounts, one can use the ``add-users`` command of the
``auth-tool`` sub command of the ASReview application:

.. code:: bash

    asreview auth-tool add-users --db-uri=sqlite:////path/example.sqlite

For more information about auth-tool and creating users, see the section
`Create user accounts <#create-user-accounts-with-auth-tool>`_ below.

Full authentication configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To configure the authentication in more detail we need to create a TOML file
that contains all relevant authentication parameters. The parameters in that
TOML file will override parameters that were passed in the CLI. Below is an
example of a TOML file (extension `.toml`) that enables authentication and OAuth
with Github, Orcid and Google. It also enables email verification and allows
users to create their own accounts. The email server is configured to confirm
new accounts and to allow users to retrieve a new password if they forget it.
The TOML file also contains the necessary parameters to run the application in a
secure way (https).

.. code-block::  toml

    DISABLE_LOGIN = false
    SECRET_KEY = "<secret key>"
    SECURITY_PASSWORD_SALT = "<salt>"
    SESSION_COOKIE_SECURE = true
    REMEMBER_COOKIE_SECURE = true
    SESSION_COOKIE_SAMESITE = "Lax"
    SQLALCHEMY_TRACK_MODIFICATIONS = true
    ALLOW_ACCOUNT_CREATION = true
    ALLOW_TEAMS = false
    EMAIL_VERIFICATION = false

    MAIL_SERVER = "<smtp-server>"
    MAIL_PORT = 465
    MAIL_USERNAME = "<smtp-server-username>"
    MAIL_PASSWORD = "<smtp-server-password>"
    MAIL_USE_TLS = false
    MAIL_USE_SSL = true
    MAIL_DEFAULT_SENDER = "<preferred reply email address>"

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

Store the TOML file on the server and start the ASReview application from the
CLI with the ``--flask-configfile`` parameter:

.. code:: bash

        asreview lab --flask-configfile=<path-to-TOML-config-file>

A number of the keys in the TOML file are standard Flask parameters. The keys
that are specific for authenticating ASReview are summarized below:

- DISABLE_LOGIN: if set to ``false`` the application will start with
  authentication. If the SQLite database does not exist, one will be
  created during startup.
- SECRET_KEY: the secret key is a string that is used to encrypt cookies and is
  mandatory if authentication is required.
- SECURITY_PASSWORD_SALT: another string used to hash passwords, also mandatory
  if authentication is required.
- SESSION_COOKIE_SAMESITE: Restrict how cookies are sent with requests from external
  sites. In the example the value is set to "Lax" which is the recommended option. If
  backend and frontend are served on different domains set to the string "None".
- ALLOW_ACCOUNT_CREATION: enables account creation by users, either by front- or
  backend.
- EMAIL_VERIFICATION: used in conjunction with ALLOW_ACCOUNT_CREATION. If set to
  ``true`` the system sends a verification email after account creation. Only
  relevant if the account is __not__ created by OAuth. This parameter can be
  omitted if you don't want verification.
- MAIL_<PAR>: configuration parameters to setup the SMTP email server that is used
  for email verification. It also allows users to retrieve a new password after forgetting
  it. Don't forget to enter the reply address (MAIL_DEFAULT_SENDER) of your system
  emails. Remove these parameters if system emails for verification and password
  retrieval are unwanted.
- OAUTH: an authenticated ASReview application may integrate with the OAuth
  functionality of Github, Orcid and Google. Provide the necessary OAuth login
  credentails (for `Github
  <https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app>`_,
  `Orcid
  <https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/>`_
  en `Google <https://support.google.com/cloud/answer/6158849?hl=en>`_). Please
  note that the `AUTHORIZATION_URL` and `TOKEN_URL` of the Orcid entry are
  sandbox-urls, and thus not to be used in production. Omit this parameter if
  OAuth is unwanted.

The ``SQLALCHEMY_DATABASE_URI`` key is not included in the TOML file. This key
is used to configure the database connection. The default value is
``sqlite:///asreview.production.sqlite``. This means that the application will
use the SQLite database in the ASReview projects folder. If you would like to
use a different database, you can add the ``SQLALCHEMY_DATABASE_URI`` key to
the TOML file.

Set the ``SQLALCHEMY_DATABASE_URI`` environment variable to the path of the
database. For example, to use the SQLite database in the ASReview projects
folder:

.. code-block::  bash

    FLASK_SQLALCHEMY_DATABASE_URI = "sqlite:///asreview.production.sqlite"

PostgreSQL database
~~~~~~~~~~~~~~~~~~~

You can replace the SQLite database with a `PostgreSQL database
<https://www.postgresql.org/>`_. This requires an extra step during installation
and an extra step in the configuration file:

1. Install the `psycopg2 <https://www.psycopg.org/docs/>`_ package. At the time
   of this writing 2 versions of this package exist: ``psycopg2`` and
   ``psycopg2-binary``. According to the `documentation
   <https://www.psycopg.org/docs/install.html#quick-install>`_ the binary
   version works on most operating systems.
2. Then add the ``SQLALCHEMY_DATABASE_URI`` key to the config file:

.. code-block:: none

    SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://username:password@host:port/database_name"

Create authentication database and tables with auth-tool


Server administrators can create a database for authentication with the 
``auth-tool`` sub command of the ASReview application:

.. code:: bash

        asreview auth-tool create-db --db-uri=sqlite:////path/example.sqlite

Please note that in this example, the --db-uri option is explicitly configured.
However, it is not mandatory. If access to the authentication database is needed,
the auth-tool utility first checks whether the --db-uri option has been provided.
If not, it then examines the presence of the SQLALCHEMY_DATABASE_URI environment variable.
In the absence of this variable as well, the script defaults to utilizing the database URI
associated with the standard SQLite database pre-configured in the ASReview folder.

Create user accounts with auth-tool
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Create user accounts interactively or by using a JSON string to bulk insert the accounts
with ``add-users``. To add user accounts interactively run the following command:

.. code:: bash

        asreview auth-tool add-users --db-uri=sqlite:////path/example.sqlite

The tool will prompt you if you would like to add a user account. Type ``Y`` to continue
and enter an email address, name, affiliation (not required) and a password for every person.
Continue to add as many users as you would like.

If you would like to bulk insert user accounts use the ``--json`` option:

.. code:: bash

        asreview auth-tool add-users \
                --db-uri=sqlite:////path/example.sqlite \
                -j "[{\"email\": \"name@email.org\", \"name\": \"Name of User\", \"affiliation\": \"Some Place\", \"password\": \"1234@ABcd\"}]"

The JSON string represents a Python list with a dictionary for every user
account with the following keys: ``email``, ``name``, ``affiliation`` and
``password``. Note that passwords require at least one symbol. These symbols,
such as the exclamation mark, may compromise the integrity of the JSON string.

List projects with auth-tool
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The ``auth-tool`` sub command of the ASReview application can be used to list
projects.

Lists all projects with the ``list-projects`` command:

.. code:: bash

        asreview auth-tool list-projects

List the projects in JSON format with the ``--json`` flag:

.. code:: bash

        asreview auth-tool list-projects --json

The command returns a convenient JSON string that can be used to bulk insert and
link projects into the database. The string represents a list containing a
dictionary for every project.

List users with auth-tool
~~~~~~~~~~~~~~~~~~~~~~~~~

The ``auth-tool`` sub command of the ASReview application can be used to list
users.

Lists all users with the ``list-users`` command:

.. code:: bash

        asreview auth-tool list-users

Migrate projects from unauthenticated to authenticated
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

By default, the ASReview application runs in an unauthenticated mode. This means
that all projects are stored in the same workspace. This is fine for a single
user, but not for multiple users. If you would like to run the application in an
authenticated mode, you need to convert the existing projects into authenticated
ones with user identifiers assigned to each project. If you don't do this, you
won't see any projects in the authenticated mode.

First, list all users with the ``list-users`` command. Create users if you don't
have users yet.

.. code:: bash

        asreview auth-tool list-users --db-uri=sqlite:////path/example.sqlite

List all projects with the ``list-projects`` command. The command returns a

.. code:: bash

        asreview auth-tool list-projects

Migrate the projects into the authenticated database can be done interactively:

.. code:: bash

        asreview auth-tool link-projects --db-uri=sqlite:////path/example.sqlite

The tool will list project by project and asks what the ID of the owner is. That
ID can be found in the user list below the project information.

You can also insert all project information by using the JSON string that was
produced with the ``list-projects`` command. Add user identifiers to each
project in the JSON string. For example, if the user ID of the owner is ``15``,
the JSON string should look like this

.. code:: bash

        asreview auth-tool link-projects \
                --db-uri=sqlite:////path/example.sqlite \
                --json "[{\"folder\": \"project-id\", \"version\": \"1.3\", \"project_id\": \"project-id\", \"name\": \"project 1\", \"authors\": \"Authors\", \"created\": \"2023-04-12 21:23:28.625859\", \"owner_id\": 15}]"
