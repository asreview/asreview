    Installation
    ============

    Welcome to the ASReview installation guide. Set up ASReview on your preferred
    platform and begin your AI-aided systematic review with ease.

    For local installation details, see the :ref:`Local Installation
    <local-installation>` section. For Docker deployment instructions, refer to
    the :ref:`Docker Installation <docker-installation>` section. Consult
    the :ref:`Server Installation <server-installation>` section for server
    deployment guidelines. Each installation method offers full feature support
    across Windows, macOS, and Linux platforms.

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
   * - Maintenance Required
     - Moderate
     - Low
     - High
   * - User Authentication Support
     - ✗
     - ✗
     - ✓
   * - Database Flexibility
     - ✗
     - ✓
     - ✓
   * - Customizability
     - Low
     - High
     - High
   * - Network Configuration
     - ✗
     - ✓
     - ✓
   * - Backup and Export Capabilities
     - ✗
     - ✓
     - ✓
   * - Cloud Compatibility
     - ✗
     - ✓
     - ✓

.. note::

    **Service and Support**: ASReview is a proud product of `academic collaboration <https://asreview.nl/about/>`__, developed and maintained by the community. Although we do not offer Software as a Service (SaaS) or dedicated customer support typical of commercial software, we are committed to empowering users with comprehensive documentation, responsive issue resolution, and a vibrant community for peer support. For more insights into our open-source vision, visit our `blog <https://asreview.nl/blog/open-source-and-research/>`__.


.. tip::

    For advanced scenarios, such as executing ASReview simulations in cloud environments or running them in parallel, consult our specialized `cloud usage guide <https://github.com/asreview/cloud-usage>`__. This guide provides tailored instructions for a variety of use cases, including simulations on cloud platforms such as SURF, Digital Ocean, AWS, Azure, and leveraging Kubernetes for large-scale simulation tasks.


.. _python-installation:

Python
------
ASReview requires Python 3.8 or later. If you do not have Python installed, or
if you have an earlier version that needs upgrading, follow these
step-by-step instructions to install the latest version of `Python <https://www.python.org/downloads/>`__.

To verify your Python installation, open a command prompt or terminal and type


.. code:: bash

    python --version


If Python is installed and correctly added to your
system's PATH, this command will display the installed version.

Note that installation steps may differ slightly based on your operating
system. Ensure you select the option to add Python to your PATH if prompted
during the installation process on Windows. This will make it possible to run
Python from any command line interface.

.. tip::

    If you encounter issues during the installation, refer to the :doc:`Troubleshooting <troubleshooting>` section for guidance on common problems and their solutions.


.. _local-installation:

Local Installation
------------------

Opt for a local installation for swift access and direct control over your
ASReview setup. This method ensures that your data stays private and secure
on your personal machine.


Considerations for a Local Setup
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Pro's** 

- **Full Control**: Local installation gives users direct control over the ASReview environment and settings. Customize the installation to fit precise requirements without the constraints of a shared or cloud-based system.

- **Immediate Access**: Access the application instantly on your machine without needing an internet connection, allowing uninterrupted work on ASReview anytime.

- **Privacy and Security**: With sensitive data stored on your local system, a local setup can offer additional layers of security and privacy, essential for handling confidential or proprietary research materials.

**Considerations**

- **System Dependencies**: A local installation may require extra steps to manage system dependencies, particularly when navigating different operating systems or conflicting software versions.

- **Resource Limitations**: Your local hardware's capabilities may restrict the performance and scalability of ASReview. Large datasets or computationally intensive tasks might not perform optimally on a personal machine.

- **Manual Updates**: Maintaining the software's currency requires manual updates. Users must stay vigilant about checking for and implementing updates to access the latest features and security enhancements.

.. tip::

        **Important Note on Data Backup**: When using ASReview in a local setup, your project files (``.asreview`` files) are stored on your local machine. To safeguard your work against data loss due to hardware failure or other unforeseen events, we strongly advise regularly exporting your project files and storing them in a secure, backed-up location. This practice ensures that your research can be recovered and continued from the last saved state, maintaining the integrity of your systematic review.

Install
~~~~~~~

Install the ASReview software with Pip, the Python package installer, by executing the following command in the
`Command Prompt` on Windows or `Terminal` on MacOS/Linux:

.. code:: bash

    pip install asreview

Once installed, start the application with:

.. code:: bash

    asreview lab

The ASReview LAB software will start in your web browser. For additional options on starting
ASReview LAB, refer to :doc:`start`.


Dependencies
~~~~~~~~~~~~

Certain advanced models in ASReview require additional dependencies. 

To install all optional dependencies at once, use the following command:

.. code:: bash

    pip install asreview[all]

Alternatively, you may install only the specific dependencies required for
particular models or features. For example, some feature extraction
techniques require TensorFlow. To install TensorFlow, run:

.. code:: bash

    pip install tensorflow 

For detailed information about model-specific dependencies, refer to
the 'Models' section in the :doc:API Reference <api/models>.


Upgrade
~~~~~~~

To ensure you have the latest features and improvements, you can upgrade your
ASReview software to the newest version using the following command:

.. code:: bash

    pip install --upgrade asreview

It's recommended to periodically check for updates to maintain access to the
most recent enhancements and fixes.


Uninstall
~~~~~~~~~

To remove ASReview from your system, use the following command:

.. code:: bash

    pip uninstall asreview

When prompted, enter y to confirm the uninstallation.

.. warning::

    Uninstalling ASReview will **not** delete your project files. These are located in the `.asreview` directory within your home folder and must be removed manually if desired.



File Location
~~~~~~~~~~~~~

To determine the location where the `.asreview` files are stored on your system,
execute the following command:

.. code:: bash

    python -c "from asreview import asreview_path; print(asreview_path())"

.. tip::

    Regularly back up your `.asreview` project files to prevent data loss. Export your project files by following the instructions in the :ref:`manage-export` section and store them in a secure, backed-up location.


.. _docker-installation:

Install with Docker
-------------------

For a containerized version of ASReview, ensure that Docker is installed on
your system.

Run the following command to install and start ASReview LAB, accessible at
http://localhost:5000:

.. code:: bash

   docker run -p 5000:5000 ghcr.io/asreview/asreview:latest lab


To specify advanced options, such as changing the port, append command-line
arguments like so:

.. code:: bash

   docker run -p 9000:9000 ghcr.io/asreview/asreview lab --port 9000

ASReview LAB is now installed. Open the URL in your host web browser,
``http://localhost:5000``, and get started.


Mount local volume
~~~~~~~~~~~~~~~~~~

To persist data and facilitate easy access to project files, mount a local
directory to the container using the `-v` flag. Replace path-to-your-folder
with the desired local path. This allows ASReview LAB to store and retrieve
projects from the specified directory. It is also possible for multiple
containers to share access to this directory.

.. code:: bash

    docker run -p 5000:5000 -v path-to-your-folder:/project ghcr.io/asreview/asreview:latest lab

Named container
~~~~~~~~~~~~~~~

Creating a named container simplifies the management of your Docker workflow.
Set up a named container using the docker create command:

.. code:: bash

    docker create --name asreview-lab -p 5000:5000 -v path-to-your-folder:/project_folder ghcr.io/asreview/asreview lab

To start the ASReview LAB container, execute:

.. code:: bash

    docker start asreview

To stop it, replace `start` with `stop`. Monitor running containers with
`docker ps`.

Customize the image
~~~~~~~~~~~~~~~~~~~


For additional features or personal customization, modify the `Dockerfile` from the ASReview repository. After making changes, build your custom image and run it:

.. code:: bash

    docker build -t asreview/asreview:custom .
    docker run -p 5000:5000 asreview/asreview:custom lab

If you want to add more extensisons, or build the Docker image yourself, check the file `Dockerfile <https://github.com/ghcr.io/asreview/asreview/tree/master/Dockerfiles>`.


.. _server-installation:

Server Installation
-------------------

ASReview can be deployed on a server environment or a custom domain for
broader access. To configure the application to listen on a specific IP
address and port, use the --ip and --port flags when starting ASReview LAB:

.. code:: bash

    asreview lab --port 5555 --ip xxx.x.x.xx

Replace xxx.x.x.xx with your server's actual IP address or domain name.

.. tip::

    For server installations and deployments, it is advised that users possess the requisite technical expertise to manage and maintain the software in their respective environments.Remember to ensure that your network and server configurations adhere to your organization's security policies when exposing the application to a closed network.

.. warning::

    The development server provided by Flask is not suitable for production use. For guidelines on deploying a Flask application in a production environment, refer to the official Flask documentation: `Deploying to Production <https://flask.palletsprojects.com/en/2.0.x/tutorial/deploy/>`__.


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

 
