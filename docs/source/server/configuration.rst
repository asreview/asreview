Server configuration
====================

ASReview LAB offers a number of options to run the application on a server. It
is possible to run the application on a server with or without authentication.
The latter is the default option. This page describes how to configure the
ASReview LAB application to run on a server with authentication enabled. With
authentication enabled, users can run their projects in their own separate
workspaces. Authentication requires the storage of user accounts and links these
accounts to projects. Currently, we are using a SQLite database
(asreview.development.sqlite or asreview.production.sqlite) in the ASReview
projects folder to store that information.

Getting started
---------------

To configure the authentication in more detail, we need to create a TOML file
that contains all relevant authentication parameters. The parameters in that
TOML file will override parameters that were passed in the CLI. Below is an
example of a TOML file (extension `.toml`) that enables authentication and OAuth
with GitHub, ORCID, and Google. It also enables email verification and allows
users to create their own accounts. The email server is configured to confirm
new accounts and to allow users to retrieve a new password if they forget it.
The TOML file also contains the necessary parameters to run the application in a
secure way (HTTPS).

.. code-block::  toml

    DISABLE_LOGIN = false LOGIN_DURATION = 31 SECRET_KEY = "<secret key>"
    SECURITY_PASSWORD_SALT = "<salt>" SESSION_COOKIE_SECURE = true
    REMEMBER_COOKIE_SECURE = true SESSION_COOKIE_SAMESITE = "Lax"
    SQLALCHEMY_TRACK_MODIFICATIONS = true ALLOW_ACCOUNT_CREATION = true
    EMAIL_VERIFICATION = false

    MAIL_SERVER = "<smtp-server>" MAIL_PORT = 465 MAIL_USERNAME =
    "<smtp-server-username>" MAIL_PASSWORD = "<smtp-server-password>"
    MAIL_USE_TLS = false MAIL_USE_SSL = true MAIL_DEFAULT_SENDER = "<preferred
    reply email address>"

    [OAUTH]
            [OAUTH.GitHub] AUTHORIZATION_URL =
            "https://github.com/login/oauth/authorize" TOKEN_URL =
            "https://github.com/login/oauth/access_token" CLIENT_ID = "<GitHub
            client ID>" CLIENT_SECRET = "<GitHub client secret>" SCOPE = ""

            [OAUTH.Orcid] AUTHORIZATION_URL =
            "https://sandbox.orcid.org/oauth/authorize" TOKEN_URL =
            "https://sandbox.orcid.org/oauth/token" CLIENT_ID = "<Orcid client
            ID>" CLIENT_SECRET = "<Orcid client secret>"

            [OAUTH.Google] AUTHORIZATION_URL =
            "https://accounts.google.com/o/oauth2/auth" TOKEN_URL =
            "https://oauth2.googleapis.com/token" CLIENT_ID = "<Google client
            ID>" CLIENT_SECRET = "<Google client secret>" SCOPE = "profile
            email"

Not that the SCOPE parameter is missing for Orcid: to retrieve user data from
Orcid, multiple calls have to be made with different scopes. Therefor the scopes
are hard-coded.

Store the TOML file on the server and start the ASReview application from the
CLI with the ``--config-path`` parameter:

.. code:: bash

        asreview lab --config-path=<path-to-TOML-config-file>

A number of the keys in the TOML file are standard Flask parameters. The keys
that are specific for authenticating ASReview are summarized below:

- DISABLE_LOGIN: if set to ``false`` the application will start with
  authentication. If the SQLite database does not exist, one will be created
  during startup.
- LOGIN_DURATION: number of days that a user should remain logged in. Default:
  31.
- SECRET_KEY: the secret key is a string that is used to encrypt cookies and is
  mandatory if authentication is required.
- SECURITY_PASSWORD_SALT: another string used to hash passwords, also mandatory
  if authentication is required.
- SESSION_COOKIE_SAMESITE: Restrict how cookies are sent with requests from
  external sites. In the example the value is set to "Lax" which is the
  recommended option. If backend and frontend are served on different domains
  set to the string "None".
- ALLOW_ACCOUNT_CREATION: enables account creation by users, either by front- or
  backend.
- EMAIL_VERIFICATION: used in conjunction with ALLOW_ACCOUNT_CREATION. If set to
  ``true`` the system sends a verification email after account creation. Only
  relevant if the account is __not__ created by OAuth. This parameter can be
  omitted if you don't want verification.
- MAIL_<PAR>: configuration parameters to setup the SMTP email server that is
  used for email verification. It also allows users to retrieve a new password
  after forgetting it. Don't forget to enter the reply address
  (MAIL_DEFAULT_SENDER) of your system emails. Remove these parameters if system
  emails for verification and password retrieval are unwanted.
- OAUTH: an authenticated ASReview application may integrate with the OAuth
  functionality of Github, Orcid and Google. Provide the necessary OAuth login
  credentails (for `Github
  <https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app>`_,
  `Orcid
  <https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/>`_
  en `Google <https://support.google.com/cloud/answer/15549257?hl=en>`_). Please
  note that the `AUTHORIZATION_URL` and `TOKEN_URL` of the Orcid entry are
  sandbox-urls, and thus not to be used in production. Omit this parameter if
  OAuth is unwanted.

The ``SQLALCHEMY_DATABASE_URI`` key is not included in the TOML file. This key
is used to configure the database connection. The default value is
``sqlite:///asreview.production.sqlite``. This means that the application will
use the SQLite database in the ASReview projects folder. If you would like to
use a different database, you can add the ``SQLALCHEMY_DATABASE_URI`` key to the
TOML file.


Full configuration
------------------

All ASReview LAB settings are prefixed with `ASREVIEW_LAB_`. They include all
settings from Flask configuration.

ASReview LAB settings
~~~~~~~~~~~~~~~~~~~~~

.. option:: ASREVIEW_LAB_CONFIG_PATH

   Path to ASReview LAB config TOML file with ASReview LAB configuration.

.. option:: ASREVIEW_LAB_SECRET_KEY

   Secret key for ASReview LAB.

Login configuration
~~~~~~~~~~~~~~~~~~~~

.. option:: ASREVIEW_LAB_AUTHENTICATION

   If false, login is disabled and no password is required to use ASReview LAB.

.. option:: ASREVIEW_LAB_SQLALCHEMY_DATABASE_URI

   Database URI for ASReview LAB.

Account creation configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. option:: ASREVIEW_LAB_ALLOW_ACCOUNT_CREATION

   If true, account creation is enabled.

.. option:: ASREVIEW_LAB_SECURITY_PASSWORD_SALT

   Salt for password hashing.

.. option:: ASREVIEW_LAB_RE_CAPTCHA_V3

   If true, reCAPTCHA v3 is enabled for account creation.

OAuth configuration
~~~~~~~~~~~~~~~~~~~~

.. option:: ASREVIEW_LAB_OAUTH

   OAuth configuration for ASReview LAB. It is a dictionary with the following
   keys: `GitHub`, `Orcid`, and `Google`. Each of these keys is a dictionary
   with the following keys: `AUTHORIZATION_URL`, `TOKEN_URL`, `CLIENT_ID`,
   `CLIENT_SECRET`, and `SCOPE`.

Remote user configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. option:: ASREVIEW_LAB_REMOTE_USER

   Remote user configuration for ASReview LAB. It is a dictionary with the
   following keys: `USER_IDENTIFIER_HEADER`, `USER_NAME_HEADER`,
   `USER_EMAIL_HEADER`, `USER_AFFILIATION_HEADER`, `DEFAULT_EMAIL`,
   `DEFAULT_AFFILIATION`, `REMOTE_AUTH_SECRET`.

Cookie configuration
~~~~~~~~~~~~~~~~~~~~~

.. option:: ASREVIEW_LAB_REMEMBER_COOKIE_*

   Login-related cookie settings. Refer to Flask-Login documentation for
   details.

Mail configuration
~~~~~~~~~~~~~~~~~~~

.. option:: ASREVIEW_LAB_EMAIL_VERIFICATION

   If true, email verification is required for new accounts.

.. option:: ASREVIEW_LAB_MAIL_*

   Mail-related configuration. Refer to Flask-Mail documentation for details.

CORS configuration
~~~~~~~~~~~~~~~~~~~

.. option:: ASREVIEW_LAB_CORS_*

   CORS configuration. Refer to Flask-CORS documentation for details, except
   `ASREVIEW_LAB_CORS_SUPPORTS_CREDENTIALS`, which is always true.
   `ASREVIEW_LAB_CORS_ORIGINS` is used to link backend to frontend on different
   host and port.
