Migration
=========

This guide explains how to use the `asreview migrate` command to ensure your
database or projects are compatible with the latest stable version of ASReview,
specifically for migrating from version 1 (v1) to version 2 (v2).

Migration Steps Version 1 to Version 2
--------------------------------------

Follow these two steps to complete the migration process:

Step 1: Migrate the Database
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The first step is to migrate the database, which includes user profiles and
other related data. Server administrators using the ASReview Lab Docker stack
should run the migration command inside the Docker container. For example:

.. code-block:: bash

    docker exec -it asreviewlab_asreview asreview migrate --db

Run the following command to migrate the database:

.. code-block:: bash

    asreview migrate --db

If you are using a custom database URI, specify the URI of the database.

.. code-block:: bash

    asreview migrate --db --db-uri sqlite:///custom_database.sqlite

By default, the value is taken from the environment variable
``ASREVIEW_LAB_SQLALCHEMY_DATABASE_URI``. If not set, the default is
``asreview.production.sqlite`` in the ASReview folder.

Step 2: Migrate the Projects
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

After migrating the database, proceed to migrate the projects format.

Run the following command:

.. code-block:: bash

    asreview migrate --projects

This ensures that all your projects are updated to the latest compatible format.
