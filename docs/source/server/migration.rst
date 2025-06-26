Migration
=========

This guide explains how to use the `asreview migrate` command to ensure your
database or projects are compatible with the latest stable version of ASReview,
specifically for migrating from version 1 (v1) to version 2 (v2).

Migration Steps Version 1 to Version 2
--------------------------------------

Follow these two steps to complete the migration process:

Step 1: Backing Up Before Migration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Before starting the migration, it is recommended to back up both the
database and the projects folder. This precaution prevents data loss
and provides a recovery point in case of errors.

Backing up the default SQLite3 database can be done by copying the database
file to a different location:

.. code-block:: bash

    cp /home/username/.asreview/asreview.production.sqlite /home/username/new_folder

The project files are located in the dedicated ASReview folder. To create
a copy of all files recursively:

.. code-block:: bash

    cp -r /home/username/.asreview /home/username/new_folder

For server administrators using the ASReview Lab Docker stack, backing up
the projects and database requires executing commands within the running
Docker containers.

To start, identify the active containers:

.. code-block:: bash

    docker ps --format "{{.Names}}"

Example output:

.. code-block:: console

    asreview-server-stack-server-1
    asreview-server-stack-asreview-1
    asreview-server-stack-database-1

Back up the PostgreSQL database using the following command:

.. code-block:: bash

    docker exec -u postgres asreview-server-stack-database-1 pg_dump asreview_db > /home/username/new_folder/asreview.backup.sql

To back up all project files, copy the contents of the ``project_folder``
volume from the container to the host system:

.. code-block:: bash

    docker cp asreview-server-stack-asreview-1:/project_folder /home/username/new_folder/asreview-projects-backup

Step 2: Migrate the Database
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The first step is to migrate the database, which includes user profiles and
other related data.

Run the following command to migrate the database:

.. code-block:: bash

    asreview migrate --db

If you are using a custom database URI, specify the URI of the database.

.. code-block:: bash

    asreview migrate --db --db-uri sqlite:///custom_database.sqlite

By default, the value is taken from the environment variable
``ASREVIEW_LAB_SQLALCHEMY_DATABASE_URI``. If not set, the default is
``asreview.production.sqlite`` in the ASReview folder.

Server administrators using the ASReview Lab Docker stack
should run the migration command inside the Docker container. For example:

.. code-block:: bash

    docker exec -it asreview-server-stack-asreview-1 asreview migrate --db

Step 3: Migrate the Projects
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

After migrating the database, proceed to migrate the projects format.

Run the following command:

.. code-block:: bash

    asreview migrate --projects

This ensures that all your projects are updated to the latest compatible
format.

To perform the project migration within the ASReview Lab Docker stack,
run the following command inside the container:

.. code-block:: bash

    docker exec -it asreview-server-stack-asreview-1 asreview migrate --projects
