__all__ = ["MigrationTool"]

import argparse
import os
from datetime import datetime
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy import inspect
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from asreview.webapp.utils import asreview_path
from asreview.webapp.utils import get_projects
from asreview.project.migrate import migrate_project_v1_v2

DEFAULT_DATABASE_URI = f"sqlite:///{str(asreview_path())}/asreview.production.sqlite"

DB_URI_HELP = (
    "URI of the database. By default, the value is given by the environment "
    "variable ASREVIEW_LAB_SQLALCHEMY_DATABASE_URI. If not set, the default "
    "is 'asreview.production.sqlite' in the ASReview folder."
)


def auth_parser():
    parser = argparse.ArgumentParser(
        prog="migration-tool",
        description="""
Tool that ensures your database or projects are compatible with the
latest stable version of ASReview
        """,
        formatter_class=argparse.RawTextHelpFormatter,
        epilog="Use -h or --help to view the available options.",
    )

    parser.add_argument(
        "--db",
        action="store_true",
        help="Migrate the database to the latest compatible version.",
    )

    parser.add_argument(
        "--projects",
        action="store_true",
        help="Migrate projects format to the latest compatible version.",
    )

    parser.add_argument(
        "--db-uri",
        type=str,
        default=None,
        help=DB_URI_HELP,
    )

    parser.add_argument(
        "--set-existing-users-terms-accepted",
        type=str,
        choices=["true", "false"],
        default=None,
        help="Override default terms acceptance for existing users (true/false). If not specified, defaults to true.",
    )

    return parser


class MigrationTool:
    def _run_db_migration(self, interactive=False):
        """
        Core database migration logic.

        Parameters
        ----------
        interactive : bool
            If True, prompt user for destructive operations.
            If False, only warn about obsolete tables.
        """
        Session = sessionmaker()
        engine = create_engine(self.uri)
        Session.configure(bind=engine)
        self.session = Session()

        # Inspect the current database schema
        inspector = inspect(engine)

        # Get current columns in "users" table
        user_columns = [col["name"] for col in inspector.get_columns("users")]

        # Get current columns in "projects" table
        project_columns = [col["name"] for col in inspector.get_columns("projects")]

        # Migration for user and project fields
        self._migrate_new_user_fields(engine, user_columns)
        self._migrate_new_project_fields(engine, project_columns)

        # Remove obsolete user fields
        self._remove_obsolete_user_fields(engine, user_columns)

        # Check for obsolete tables
        self._cleanup_obsolete_tables(engine, inspector, interactive=interactive)

    def migrate_database(self, db_uri=None, set_existing_users_terms_accepted=None):
        """
        Run database migration programmatically without command-line arguments.
        This is used for automatic migration on server startup.

        Parameters
        ----------
        db_uri : str, optional
            Database URI. If not provided, uses environment variables or default.
        set_existing_users_terms_accepted : bool, optional
            Override default terms acceptance for existing users.
        """
        # Determine DB URI
        self.uri = (
            db_uri
            or os.environ.get("SQLALCHEMY_DATABASE_URI")
            or os.environ.get("ASREVIEW_LAB_SQLALCHEMY_DATABASE_URI")
            or DEFAULT_DATABASE_URI
        )

        # Create a minimal args object for compatibility with existing methods
        class Args:
            def __init__(self):
                self.set_existing_users_terms_accepted = None

        self.args = Args()
        if set_existing_users_terms_accepted is not None:
            self.args.set_existing_users_terms_accepted = (
                "true" if set_existing_users_terms_accepted else "false"
            )

        print("Running database migration...")
        print(f"Database URI: {self.uri}")

        try:
            self._run_db_migration(interactive=False)
            print("Database migration completed successfully.")
            return True
        except Exception as e:
            print(f"Database migration failed: {e}")
            return False

    def execute(self, argv):
        parser = auth_parser()
        args = parser.parse_args(argv)

        self.args = args
        self.argv = argv

        # Determine DB URI
        self.uri = (
            self.args.db_uri
            or os.environ.get("SQLALCHEMY_DATABASE_URI")
            or os.environ.get("ASREVIEW_LAB_SQLALCHEMY_DATABASE_URI")
            or DEFAULT_DATABASE_URI
        )
        print("Start database migration...")
        print(f"Found database URI: {self.uri}")

        if self.args.db:
            self._run_db_migration(interactive=True)
            print("Migration done...")

        if self.args.projects:
            print("Make a backup of your projects before running this command.")
            print(
                "This command will not delete any projects, "
                "but it will change the format.\n\n"
            )
            confirm = (
                input("Are you sure you want to migrate the projects? (y/n): ")
                .strip()
                .lower()
            )
            if confirm != "y":
                print("Migration cancelled.")
                return
            print("Migrating projects...")

            for project in get_projects():
                if project.config.get("version", "").startswith("1."):
                    print(
                        f"Project {project.project_path} is in the old format. "
                        "Migrating..."
                    )
                    migrate_project_v1_v2(project.project_path)
                elif project.config.get("version", "").startswith("2."):
                    print(
                        f"Project {project.project_path} is already in the new format."
                    )
                else:
                    print(
                        f"Project {project.project_path} is in an unknown format or very old version."
                    )

    def _migrate_new_user_fields(self, engine, user_columns):
        """Migrate user field."""

        # Migration for role column (existing logic)
        if "role" not in user_columns:
            df_role = "member"

            # Add role column
            try:
                print("Adding column 'role' in the Users table...")
                qry = f"ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT '{df_role}';"
                with engine.begin() as conn:
                    conn.execute(text(qry))
            except Exception as e:
                print(f"Unable to add column 'role': {e}")

            # Add default values in existing rows
            try:
                print("Populating default roles...")
                qry = f"UPDATE users SET role = '{df_role}' WHERE role IS NULL;"
                with engine.begin() as conn:
                    conn.execute(text(qry))
            except Exception as e:
                print(f"Failed to populate roles: {e}")

        current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Add created_at column to users table
        if "created_at" not in user_columns:
            try:
                print("Adding column 'created_at' to users table...")
                # PostgreSQL uses TIMESTAMP, other databases use DATETIME
                datetime_type = (
                    "TIMESTAMP" if engine.dialect.name == "postgresql" else "DATETIME"
                )
                qry = f"ALTER TABLE users ADD COLUMN created_at {datetime_type};"
                with engine.begin() as conn:
                    conn.execute(text(qry))

                # Populate with current timestamp for existing users
                print("Setting created_at timestamp for existing users...")
                qry = f"UPDATE users SET created_at = '{current_timestamp}' WHERE created_at IS NULL;"
                with engine.begin() as conn:
                    conn.execute(text(qry))
            except Exception as e:
                print(f"Failed to add/populate created_at for users: {e}")

        # Add terms_accepted column to users table
        if "terms_accepted" not in user_columns:
            # Determine terms_accepted value for existing users
            if self.args.set_existing_users_terms_accepted is not None:
                terms_accepted_value = (
                    self.args.set_existing_users_terms_accepted.lower() == "true"
                )
            else:
                terms_accepted_value = True  # Default to True for existing users

            try:
                print("Adding column 'terms_accepted' to users table...")
                qry = (
                    "ALTER TABLE users ADD COLUMN terms_accepted BOOLEAN DEFAULT FALSE;"
                )
                with engine.begin() as conn:
                    conn.execute(text(qry))

                # Set terms_accepted for existing users based on flag
                print(
                    f"Setting terms_accepted to {terms_accepted_value} for existing users..."
                )
                qry = (
                    f"UPDATE users SET terms_accepted = {int(terms_accepted_value)} "
                    + "WHERE created_at IS NOT NULL;"
                )
                with engine.begin() as conn:
                    conn.execute(text(qry))
            except Exception as e:
                print(f"Failed to add/populate terms_accepted for users: {e}")

    def _migrate_new_project_fields(self, engine, project_columns):
        """Migrate new project fields."""

        # Add created_at column to projects table
        if "created_at" not in project_columns:
            try:
                print("Adding column 'created_at' to projects table...")
                # PostgreSQL uses TIMESTAMP, other databases use DATETIME
                datetime_type = (
                    "TIMESTAMP" if engine.dialect.name == "postgresql" else "DATETIME"
                )
                qry = f"ALTER TABLE projects ADD COLUMN created_at {datetime_type};"
                with engine.begin() as conn:
                    conn.execute(text(qry))

                # Populate with inferred timestamps for existing projects
                print("Inferring created_at timestamps for existing projects...")
                self._populate_project_timestamps(engine)
            except Exception as e:
                print(f"Failed to add/populate created_at for projects: {e}")

        # Add token column to projects table
        if "token" not in project_columns:
            try:
                print("Adding column 'token' to projects table...")
                qry = "ALTER TABLE projects ADD COLUMN token VARCHAR(128);"
                with engine.begin() as conn:
                    conn.execute(text(qry))
                print("Token column added...")
            except Exception as e:
                print(f"Failed to add token column to projects: {e}")

    def _remove_obsolete_user_fields(self, engine, user_columns):
        """Remove obsolete user fields."""

        # Remove obsolete 'public' column from users table
        if "public" in user_columns:
            try:
                print("Removing obsolete 'public' column from users table...")
                qry = "ALTER TABLE users DROP COLUMN public;"
                with engine.begin() as conn:
                    conn.execute(text(qry))
                print("Column 'public' removed successfully.")
            except Exception as e:
                print(f"Failed to remove 'public' column: {e}")
                print(
                    "Note: SQLite doesn't support DROP COLUMN in older versions. "
                    "You may need to manually migrate the database."
                )

    def _populate_project_timestamps(self, engine):
        """Populate project created_at timestamps by inferring from filesystem."""

        # Get all projects from database
        with engine.begin() as conn:
            result = conn.execute(
                text("SELECT id, project_id FROM projects WHERE created_at IS NULL")
            )
            projects = result.fetchall()

        current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        for project_row in projects:
            project_id = project_row[1]  # project_id column
            db_id = project_row[0]  # id column (primary key)

            # Try to get creation time from filesystem
            try:
                project_path = Path(asreview_path()) / project_id
                if project_path.exists():
                    # Get creation time (or modification time as fallback)
                    creation_time = datetime.fromtimestamp(project_path.stat().st_ctime)
                    timestamp_str = creation_time.strftime("%Y-%m-%d %H:%M:%S")
                    print(
                        f"  Project {project_id}: using filesystem timestamp {timestamp_str}"
                    )
                else:
                    # Project folder doesn't exist, use current timestamp
                    timestamp_str = current_timestamp
                    print(
                        f"  Project {project_id}: folder not found, using current timestamp"
                    )

                # Update the project with the timestamp
                qry = f"UPDATE projects SET created_at = '{timestamp_str}' WHERE id = {db_id};"
                with engine.begin() as conn:
                    conn.execute(text(qry))

            except Exception as e:
                # If anything fails, use current timestamp
                print(
                    f"  Project {project_id}: error accessing filesystem ({e}), using current timestamp"
                )
                qry = f"UPDATE projects SET created_at = '{current_timestamp}' WHERE id = {db_id};"
                with engine.begin() as conn:
                    conn.execute(text(qry))

    def _cleanup_obsolete_tables(self, engine, inspector, interactive=True):
        """
        Check for and optionally remove obsolete tables.

        Parameters
        ----------
        engine : sqlalchemy.engine.Engine
            Database engine.
        inspector : sqlalchemy.engine.reflection.Inspector
            Database inspector.
        interactive : bool, optional
            If True, prompt user for confirmation before dropping tables.
            If False, only log a warning without dropping. Default is True.
        """
        # Get list of existing tables
        existing_tables = inspector.get_table_names()

        # Check for collaboration_invitations table
        if "collaboration_invitations" in existing_tables:
            if interactive:
                # Interactive mode: prompt user for confirmation
                print(
                    "\nWARNING: The 'collaboration_invitations' table is obsolete and should be removed."
                )
                print(
                    "This table may contain pending invitation records that will be lost."
                )
                print(
                    "The new invitation system uses shareable links instead of user-by-user invitations."
                )

                confirm = (
                    input(
                        "\nDo you want to remove the 'collaboration_invitations' table? (y/n): "
                    )
                    .strip()
                    .lower()
                )

                if confirm != "y":
                    print("Skipping removal of 'collaboration_invitations' table.")
                    return

                try:
                    print("Removing obsolete 'collaboration_invitations' table...")
                    qry = "DROP TABLE IF EXISTS collaboration_invitations;"
                    with engine.begin() as conn:
                        conn.execute(text(qry))
                    print("Table 'collaboration_invitations' removed successfully.")
                except Exception as e:
                    print(f"Failed to drop collaboration_invitations table: {e}")
            else:
                # Non-interactive mode: just log a warning
                print(
                    "\nWARNING: Obsolete table 'collaboration_invitations' detected in database."
                )
                print("This table is no longer used by the application.")
                print("To remove it, run: asreview migrate --db\n")
