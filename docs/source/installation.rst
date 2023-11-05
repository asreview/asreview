Installation
============


Welcome to the ASReview installation guide. Set up ASReview with ease on any
platform and start your automated literature review.


See the :ref:`Local Installation <local-installation>` section for details on
installing ASReview locally. Refer to the :ref:`Docker Installation
<docker-installation>` section for instructions on deploying ASReview with
Docker. For server deployment, consult the :ref:`Server Installation
<server-installation>` section. Each method offering full feature support
across Windows, macOS, and Linux.


.. list-table::
   :header-rows: 1

   * - Installation Method
     - Local
     - Docker
     - Server
   * - Ease of Setup
     - ✓
     - ✓
     - ✗
   * - Isolation from Host System
     - ✗
     - ✓
     - ✓
   * - Performance
     - High
     - Moderate
     - High
   * - Auto-updates
     - ✗
     - ✓
     - ✓
   * - Maintenance Required
     - Moderate
     - Low
     - High


.. _python-installation:

Python
------
All the ASReview software requires an installation of Python 3.8 or later.
Step-by-step instructions to install Python (and ASReview) are available for
`Windows <https://asreview.ai/download>`__ and `macOS/Linux
<https://asreview.ai/download/>`__ users. 


.. _local-installation:

Local Installaton
-----------------

EXPLAIN BENEFITS OF LOCAL INSTALLATION
EXPLAIN LOCAL DISADVANTAGE, NAMELY FILES ARE STORED LOCALLY

Install
~~~~~~~

Install the ASReview software with Pip by running the following command in the
`Command Prompt` (Windows) or `Terminal` (MacOS/Linux):

.. code:: bash

    pip install asreview

Start the application with the following command (in CMD.exe or Terminal):

.. code:: bash

    asreview lab

The ASReview LAB software starts in the browser. For more options on starting
ASReview LAB, see :doc:`start`.

.. note::

    See :doc:`troubleshooting` for common problems during installation.

.. tip::

    For users with Apple M1 computers, if you experience problems, follow the
    `instructions
    <https://github.com/asreview/asreview/issues/738>`__.


Dependencies
~~~~~~~~~~~~

Some models require additional dependencies to be installed. Use pip install
asreview[all] to install all additional dependencies at once or check the
installation instruction in section Models of the API Reference.

For example, some feature extraction technique requires tensorflow to be installed. Use 

.. code:: bash

    pip install tensorflow 

or install all optional ASReview dependencies with 

.. code:: bash

    pip install asreview[all]


Upgrade
~~~~~~~

Upgrade ASReview software with

.. code:: bash

    pip install --upgrade asreview



Uninstall
~~~~~~~~~

Remove ASReview with

.. code:: bash

    pip uninstall asreview

Enter ``y`` to confirm.

.. warning::

    Note that your project files will **not** delete with this action. You find them in the `.asreview` folder in your home folder.


File Location
~~~~~~~~~~~~~

To obtain the location where the `.asreview` files are stored, use

.. code:: bash

    asreview.asreview_path()

.. tip::

    We recommend making regular back-ups of your projects by exporting [ADD LINK] the `.asreview` and saving it on a location which is back-uped

.. _docker-installation:

Install with Docker
-------------------

ASReview is also available as a Docker container. Make sure you have
Docker installed on your machine.

To install and start ASReview LAB at http://localhost:5000, run the following:

.. code:: bash

   docker run -p 5000:5000 ghcr.io/asreview/asreview:latest lab


More advanced command line options can be given
afterward, like this:

.. code:: bash

   docker run -p 9000:9000 ghcr.io/asreview/asreview lab --port 9000

.. tip::

    ASReview LAB is now installed. Open the URL in your host web browser:
    ``http://localhost:5000`` and get started.


Mount local volume
~~~~~~~~~~~~~~~~~~

To mount the container to your local project folder (or any other local
folder), the `-v` flag can be used. To do so, adjust path-to-your-folder to
your local folder. When a project folder is specified, ASReview LAB will store
and load all its projects from this folder. Note that multiple containers can
access the same folder.

.. code:: bash

    docker run -p 5000:5000 -v path-to-your-folder:/project_folder ghcr.io/asreview/asreview lab

Named container
~~~~~~~~~~~~~~~

To make the usage easier, you can create a named container like the following:

.. code:: bash

    docker create --name asreview-lab -p 5000:5000 -v path-to-your-folder:/project_folder ghcr.io/asreview/asreview lab

To start asreview, enter:

.. code:: bash

    docker start asreview

To stop it, just use `stop` instead of `start`.
You can also check which images are running with `docker ps`.

Customize the image
~~~~~~~~~~~~~~~~~~~

If you want to add more extensions, or build the Docker image yourself, check the file `Dockerfile <https://github.com/ghcr.io/asreview/asreview/tree/master/Dockerfiles>`.
Modify it as you see fit, and then build and run the image with:

.. code:: bash

    docker build -t asreview/asreview:custom .
    docker run -p 5000:5000 ghcr.io/asreview/asreview:custom lab


.. _server-installation:

Server Installation
-------------------

It is possible to run the ASReview software on a server or custom domain. Use
the flags `ip` and `port` for configuration. ASReview should only be used in
closed networks.

.. code:: bash

    asreview lab --port 5555 --ip xxx.x.x.xx

.. warning::

    Don't use the development server in production. Read the Flask documentation
    about `deploying a Flask app to production <https://flask.palletsprojects.com/en/1.1.x/tutorial/deploy/>`__.


.. _authentication-installation:

Authentication
--------------

It is possible to run ASReview with authentication, enabling multiple users to run their
projects in their own separate workspaces. Authentication requires the storage of user
accounts and link these accounts to projects. Currently we are using a small SQLite 
database (asreview.development.sqlite or asreview.production.sqlite) in the ASReview 
folder to store that information.

Note that it is possible to run the authenticated application with a 
`Postgresql database <https://www.postgresql.org/>`_. Using Postgresql requires 2 extra 
installation steps:
1. Install the `psycopg2 <https://www.psycopg.org/docs/>`_ package. At the time of this writing
2 versions of this package exist: ``psycopg2`` and ``psycopg2-binary``. According to the
`documentation <https://www.psycopg.org/docs/install.html#quick-install>`_ the binary 
version works on most operating systems.
2. Use the `configuration file <#full-configuration>`_ to setup the connection 
between the application and the database.

Bare bones authentication
~~~~~~~~~~~~~~~~~~~~~~~~~

Using authentication imposes more configuration. Let's start with running a bare bones
authenticated version of the application from the CLI:
.. code-block:: toml

    toml
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
    

where ``--enable-auth`` forces the application to run in an authenticated mode, 
``<secret key>`` is a string that is used for encrypting cookies and ``<salt>`` is
a string that is used to hash passwords.

This bare bones application only allows an administrator to create user accounts by 
editing the database without the use of the ASReview application! To facilitate this,
one could use the User model that can be found in ``/asreview/webapp/authentication/models.py``. Note that with this simple configuration it is not possible for a user to change forgotten passwords without the assistance of the administrator.

Full configuration
~~~~~~~~~~~~~~~~~~

To configure the authentication in more detail we need to create a TOML file that contains all authentication parameters. The parameters in that TOML file will override parameters that were passed in the CLI. Here's an example:
.. code-block::

    toml    DEBUG = true    AUTHENTICATION_ENABLED = true    SECRET_KEY = "<secret key>"    SECURITY_PASSWORD_SALT = "<salt>"    SESSION_COOKIE_SECURE = true    REMEMBER_COOKIE_SECURE = true    SESSION_COOKIE_SAMESITE = "Lax"    SQLALCHEMY_TRACK_MODIFICATIONS = true    ALLOW_ACCOUNT_CREATION = true    ALLOW_TEAMS = false    EMAIL_VERIFICATION = false        [EMAIL_CONFIG]    SERVER = "<smtp-server>"    PORT = 465    USERNAME = "<smtp-server-username>"    PASSWORD = "<smtp-server-password>"    USE_TLS = false    USE_SSL = true    REPLY_ADDRESS = "<preferred reply email address>"        [OAUTH]            [OAUTH.GitHub]            AUTHORIZATION_URL = "https://github.com/login/oauth/authorize"            TOKEN_URL = "https://github.com/login/oauth/access_token"            CLIENT_ID = "<GitHub client ID>"            CLIENT_SECRET = "<GitHub client secret>"            SCOPE = ""                    [OAUTH.Orcid]            AUTHORIZATION_URL = "https://sandbox.orcid.org/oauth/authorize"            TOKEN_URL = "https://sandbox.orcid.org/oauth/token"            CLIENT_ID = "<Orcid client ID>"            CLIENT_SECRET = "<Orcid client secret>"            SCOPE = "/authenticate"                [OAUTH.Google]            AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/auth"            TOKEN_URL = "https://oauth2.googleapis.com/token"            CLIENT_ID = "<Google client ID>"            CLIENT_SECRET = "<Google client secret>"            SCOPE = "profile email"    


Store the TOML file on the server and start the ASReview application from the CLI with the
``--flask-configfile`` parameter:
.. code-block::

        $ python3 -m asreview lab --flask-configfile=<path-to-TOML-config-file>    


A number of the keys in the TOML file are standard Flask parameters. The keys that are specific for authenticating ASReview are summarised below:

-  AUTHENTICATION_ENABLED: if set to ``true`` the application will start with authentication enabled. If the SQLite database does not exist, one will be created during startup.
- SECRET_KEY: the secret key is a string that is used to encrypt cookies and is mandatory if authentication is required.
- SECURITY_PASSWORD_SALT: another string used to hash passwords, also mandatory if authentication is required.
- ALLOW_ACCOUNT_CREATION: enables account creation by users, either by front- or backend.
- EMAIL_VERIFICATION: used in conjunction with ALLOW_ACCOUNT_CREATION. If set to ``true`` the system sends a verification email after account creation. Only relevant if the account is __not__ created by OAuth. This parameter can be omitted if you don't want verification.
- EMAIL_CONFIG: configuration of the SMTP email server that is used for email verification. It also allows users to retrieve a new password after forgetting it. Don't forget to enter the reply address (REPLY_ADDRESS) of your system emails. Omit this parameter if system emails for verification and password retrieval are unwanted.
- OAUTH: an authenticated ASReview application may integrate with the OAuth functionality of Github, Orcid and Google. Provide the necessary OAuth login credentails (for `Github <https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app>`_, `Orcid <https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/>`_ en `Google <https://support.google.com/cloud/answer/6158849?hl=en>`_). Please note that the AUTHORIZATION_URL and TOKEN_URL of the Orcid entry are sandbox-urls, and thus not to be used in production. Omit this parameter if OAuth is unwanted.

Optional config parameters
~~~~~~~~~~~~~~~~~~~~~~~~~~

There are three optional parameters available that control what address the ASReview server listens to, and avoid CORS issues:

.. code-block::

    toml    HOST = "0.0.0.0"    PORT = 5001    ALLOWED_ORIGINS = ["http://localhost:3000"]    


The HOST and PORT determine what address the ASReview server listens to. If this deviates from ``localhost`` and port 5000, and you run the front end separately, make sure the `front end can find the backend <https://github.com/asreview/asreview/blob/master/DEVELOPMENT.md#front-end-development-and-connectioncors-issues>`_. The ALLOWED_ORIGINS key must be set if you run the front end separately. Put in a list all URLs that your front end uses. This can be more than one URL. Failing to do so will certainly lead to CORS issues.

Do you want to use a Postgresql database? Then add the ``SQLALCHEMY_DATABASE_URI`` key to the config file:

.. code-block::

    toml    SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://username:password@host:port/database_name"    



Convert
~~~~~~~

Converting an unauthenticated application into an authenticated one


Start the application with authentication enabled for the first time. This ensures the creation of the necessary database. To avoid unwanted user input, shutdown the application.

To convert the old unauthenticated projects into authenticated ones, the following steps should be taken:

1. Create user accounts for people to sign in.
2. Convert project data and link the projects to the owner's user account.

Under the CLI sub commands of the ASReview application a tool can be found that facilitates these procedures:

.. code-block::

        $ asreview auth-tool --help    



Creating user accounts
~~~~~~~~~~~~~~~~~~~~~~

The first step is to create user accounts. This can be done interactively or by using a JSON string to bulk insert the accounts. To add user accounts interactively run the following command:
.. code-block::

        $ asreview auth-tool add-users --db-path ~/.asreview/asreview.production.sqlite    



Note that the absolute path of the sqlite database has to be provided. Also note that if your app runs in development mode, use the ``asreview.development.sqlite`` database instead. The tool will prompt you if you would like to add a user account. Type ``Y`` to continue and enter an email address, name, affiliation (not required) and a password for every person. Continue to add as many users as you would like.

If you would like to bulk insert user accounts use the ``--json`` option:
.. code-block::

        $ asreview auth-tool add-users -j "[{\"email\": \"name@email.org\", \"name\": \"Name of User\", \"affiliation\": \"Some Place\", \"password\": \"1234@ABcd\"}]" --db-path ~/.asreview/asreview.production.sqlite    


The JSON string represents a Python list with a dictionary for every user account with the following keys: ``email``, ``name``, ``affiliation`` and ``password``. Note that passwords require at least one symbol. These symbols, such as the exclamation mark, may compromise the integrity of the JSON string.

Preparing the projects
~~~~~~~~~~~~~~~~~~~~~~

After creating the user accounts, the existing projects must be stored and linked to a user account in the database. The tool provides the ``list-projects`` command to prepare for this step in case you would like to bulk store all projects. Ignore the following commands if you prefer to store all projects interactively. 

Without a flag, the command lists all projects:
.. code-block::

        $ asreview auth-tool list-projects    


If you add the ``--json`` flag:
.. code-block::

        $ asreview auth-tool list-projects --json    


the tool returns a convenient JSON string that can be used to bulk insert and link projects into the database. The string represents a Python list containing a dictionary for every project. Since the ID of the user account of 
the owner is initially unknown, the ``0`` behind every ``owner_id`` key needs to be replaced with the appropriate owner ID. That ID number can be found if we list all user accounts with the following command:
.. code-block::

        $ asreview auth-tool list-users --db-path ~/.asreview/asreview.production.sqlite    


Inserting and linking the projects into the database
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Inserting and linking the projects into the database can be done interactively:
.. code-block::

        $ asreview auth-tool link-projects --db-path ~/.asreview/asreview.production.sqlite    


The tool will list project by project and asks what the ID of the owner is. That ID can be found in the user list below the project information.

One can also insert all project information by using the JSON string that was produced in the previous step:
.. code-block::

        $ asreview auth-tool link-projects --json "[{\"folder\": \"project-id\", \"version\": \"1.1+51.g0ebdb0c.dirty\", \"project_id\": \"project-id\", \"name\": \"project 1\", \"authors\": \"Authors\", \"created\": \"2023-04-12 21:23:28.625859\", \"owner_id\": 15}]" --db-path ~/.asreview/asreview.production.sqlite    

 
