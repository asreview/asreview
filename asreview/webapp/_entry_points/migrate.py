__all__ = ["MigrationTool"]

import argparse
import os

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

    return parser


class MigrationTool:
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
            Session = sessionmaker()
            engine = create_engine(self.uri)
            Session.configure(bind=engine)
            self.session = Session()

            # Inspect the current database schema
            inspector = inspect(engine)

            # Get current columns in "users" table
            user_columns = [col["name"] for col in inspector.get_columns("users")]

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
