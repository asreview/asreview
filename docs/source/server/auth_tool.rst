Auth-Tool
=========

The `auth-tool` is a command-line utility provided by ASReview to manage user
authentication and project linking in an authenticated environment. It allows
administrators to create databases, manage user accounts, list projects, and
migrate projects from unauthenticated to authenticated modes.

Features of Auth-Tool
---------------------

- Create and manage authentication databases.
- Add user accounts interactively or in bulk.
- List users and projects in the database.
- Migrate projects to authenticated environments.

Creating the Authentication Database
------------------------------------

To create a database for authentication, use the `create-db` command:

.. code:: bash

        asreview auth-tool create-db --db-uri=sqlite:////path/example.sqlite

If the `--db-uri` option is not provided, the tool will use the default database
URI configured in the ASReview folder.

Adding User Accounts
--------------------

You can add user accounts interactively or in bulk using a JSON string.

**Interactive Mode:**

Run the following command:

.. code:: bash

        asreview auth-tool add-users --db-uri=sqlite:////path/example.sqlite

The tool will prompt you to add user details such as email, name, affiliation
(optional), and password.

**Bulk Mode:**

Use the `--json` option to add multiple users at once:

.. code:: bash

        asreview auth-tool add-users \
                --db-uri=sqlite:////path/example.sqlite \ -j "[{\"email\":
                \"name@email.org\", \"name\": \"Name of User\", \"affiliation\":
                \"Some Place\", \"password\": \"1234@ABcd\"}]"

The JSON string should contain a list of dictionaries with the following keys:
`email`, `name`, `affiliation`, and `password`.

Listing Projects
----------------

To list all projects in the database, use the `list-projects` command:

.. code:: bash

        asreview auth-tool list-projects

To get the output in JSON format, use the `--json` flag:

.. code:: bash

        asreview auth-tool list-projects --json

The JSON output can be used to bulk insert or link projects to users.

Listing Users
-------------

To list all users in the database, use the `list-users` command:

.. code:: bash

        asreview auth-tool list-users

Migrating Projects to Authenticated Mode
----------------------------------------

If you are switching from unauthenticated to authenticated mode, you need to
migrate existing projects.

**Interactive Migration:**

Run the following command:

.. code:: bash

        asreview auth-tool link-projects --db-uri=sqlite:////path/example.sqlite

The tool will prompt you to assign a user ID to each project.

**Bulk Migration:**

Use the JSON output from the `list-projects` command, add user IDs to each
project, and run:

.. code:: bash

        asreview auth-tool link-projects \
                --db-uri=sqlite:////path/example.sqlite \ --json "[{\"folder\":
                \"project-id\", \"version\": \"1.3\", \"project_id\":
                \"project-id\", \"name\": \"project 1\", \"authors\":
                \"Authors\", \"created\": \"2023-04-12 21:23:28.625859\",
                \"owner_id\": 15}]"
