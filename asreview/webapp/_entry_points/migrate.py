__all__ = ["MigrationTool"]

import argparse
import os

from sqlalchemy import create_engine
from sqlalchemy import inspect
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from asreview.webapp.utils import asreview_path

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
        "--project",
        action="store_true",
        help="Migrate project format to the latest compatible version.",
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

        if self.args.db:
            Session = sessionmaker()
            engine = create_engine(self.uri)
            Session.configure(bind=engine)
            self.session = Session()

            # Inspect the current database schema
            inspector = inspect(engine)

            # Get current columns in "users" table
            user_columns = [
                col["name"]
                for col in inspector.get_columns("users")
            ]

            if "role" not in user_columns:
                print("Adding column 'role' in the Users table...")
                with engine.connect() as conn:
                    conn.execute(
                        text("ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT 'member';")
                    )

        if self.args.project:
            # TODO: Add project/resource migration logic here
            print("Coming soon...")
