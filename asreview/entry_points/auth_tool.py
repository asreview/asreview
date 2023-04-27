import argparse
import json
from argparse import RawTextHelpFormatter
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from asreview.entry_points.base import BaseEntryPoint
from asreview.utils import asreview_path
from asreview.webapp.authentication.models import User


def auth_parser():
    parser = argparse.ArgumentParser(
        prog="auth_converter",
        description="""ASReview Authentication Conversion - convert your app to handle multiple users.""",  # noqa
        formatter_class=RawTextHelpFormatter,
        epilog="Use -h or --help on all subcommands to view the available options.",
    )

    sub_parser = parser.add_subparsers(help="The following options are available:")

    user_par = sub_parser.add_parser("add-users", help="Add users into the database.")

    user_par.add_argument(
        "-d",
        "--db-path",
        type=str,
        help="Absolute path to authentication sqlite3 database.",
        required=True,
    )

    user_group = user_par.add_mutually_exclusive_group()

    user_group.add_argument(
        "-i",
        "--interactive",
        action="store_true",
        help="Interactively insert user accounts.",
    )

    user_group.add_argument(
        "-j",
        "--json",
        type=str,
        default="[]",
        help="JSON string that contains a list with user account data.",
    )

    list_par = sub_parser.add_parser(
        "list-projects",
        help="List project info from all projects in the ASReview folder.",
    )
    list_par.add_argument(
        "-j",
        "--json",
        action="store_true",
        help="Create JSON string to connect existing projects with users.",
    )

    link_par = sub_parser.add_parser(
        "link-projects", help="Link projects to user accounts."
    )

    link_group = link_par.add_mutually_exclusive_group()

    link_group.add_argument(
        "-i",
        "--interactive",
        action="store_true",
        help="Interactively link projects to users.",
    )

    link_group.add_argument(
        "-j",
        "--json",
        type=str,
        default="[]",
        help="Use a JSON string to link projects to users.",
    )

    link_par.add_argument(
        "-d",
        "--db-path",
        type=str,
        help="Absolute path to authentication sqlite3 database.",
        required=True,
    )

    return parser


def insert_users(session, entries):
    """Inserts a list of dictionaries containing user data
    into the database."""
    # loop over entries
    for user in entries:
        # create a user object
        user = User(
            user["email"],
            email=user["email"],
            name=user["name"],
            affiliation=user["affiliation"],
            password=user["password"],
        )

        try:
            with session.begin():
                session.add(user)
            print(f"User with email {user.email} created.")
        except IntegrityError:
            print(f"User with identifier {user.email} already exists")


def insert_projects(session, projects):
    print("ha;;lpo")


def get_users(session):
    with session.begin():
        return session.query(User).all()


class AuthTool(BaseEntryPoint):

    def execute(self, argv):
        # from asreview.webapp.start_flask import main
        parser = auth_parser()
        args = parser.parse_args(argv)

        self.args = args
        self.argv = argv

        # create a conn object for the database
        if hasattr(self.args, "db_path") and self.args.db_path is not None:
            Session = sessionmaker()
            engine = create_engine(f"sqlite:///{self.args.db_path}")
            Session.configure(bind=engine)
            self.session = Session()

        if "add-users" in argv:
            self.add_users()
        elif "list-projects" in argv:
            self.list_projects()
        elif "link-projects" in argv:
            self.link_projects()

        return True

    def add_users(self):
        if self.args.interactive:
            entries = self.enter_users()
        else:
            entries = json.loads(self.args.json)
        # try to insert entries into the database
        insert_users(self.session, entries)

    def _ensure_valid_value_for(self, name, validation_function, hint=""):
        """Prompt user for validated input."""
        while True:
            value = input(f"{name}: ")
            if validation_function(value):
                return value
            else:
                print(hint)

    def enter_users(self):
        result = []
        while True:
            new_user = input("Enter a new user [Y/n]? ")
            if new_user == "Y":
                email = self._ensure_valid_value_for(
                    "Email address (required)",
                    User.valid_email,
                    "Entered email address is not recognized as a valid email address.",  # noqa
                )
                name = self._ensure_valid_value_for(
                    "Full name (required)",
                    lambda x: bool(x) and len(x) > 2,
                    "Full name must contain more than 2 characters.",
                )
                affiliation = input("Affiliation: ")
                password = self._ensure_valid_value_for(
                    "Password (required)",
                    User.valid_password,
                    "Use 8 or more characters with a mix of letters, numbers & symbols.",  # noqa
                )

                result.append(
                    {
                        "email": email,
                        "name": name,
                        "affiliation": affiliation,
                        "password": password,
                    }
                )

            else:
                break

        return result

    def _print_project(self, project):
        print(f"\n* {project['folder']}")
        print(f"\tversion: {project['version']}")
        print(f"\tid: {project['project_id']}")
        print(f"\tname: {project['name']}")
        print(f"\tcreated: {project['created']}")

    def _print_user(self, user):
        if bool(user.affiliation):
            postfix = f", {user.affiliation}"
        else:
            postfix = ""
        print(f" {user.id} - {user.email} ({user.name}){postfix}")

    def _get_projects(self):
        projects = [f for f in asreview_path().glob("*") if f.is_dir()]
        result = []
        for folder in projects:
            with open(Path(folder) / "project.json", "r") as out:
                project = json.load(out)

            result.append(
                {
                    "folder": folder.name,
                    "version": project["version"],
                    "project_id": project["id"],
                    "name": project["name"],
                    "created": project["datetimeCreated"],
                    "owner_id": 0,
                }
            )
        return result

    def list_projects(self):
        projects = self._get_projects()
        if self.args.json:
            print(json.dumps(json.dumps(projects)))
        else:
            [self._print_project(p) for p in projects]
            if len(projects) > 0:
                print()

    def _generate_project_links(self):
        result = []
        # get users and projects
        users = get_users(self.session)
        user_ids = [u.id for u in users]
        projects = self._get_projects()
        # print projects
        for project in projects:
            self._print_project(project)
            print("Who's the owner of this project?")
            print("--------------------------------")
            for user in users:
                self._print_user(user)
            id = None
            # and ask who the owner is
            while True:
                id = input("Enter the ID number of the owner: ")
                try:
                    id = id.replace(".", "")
                    id = int(id)
                    if id not in user_ids:
                        print("Entered ID does not exists, try again.")
                    else:
                        result.append(
                            {"project_id": project["project_id"], "owner_id": id}
                        )
                        break
                except ValueError:
                    print("Entered ID is not a number, please try again.")
        return result

    def link_projects(self):
        # interactive vs bulk with JSON
        if self.args.interactive is True:
            projects = self._generate_project_links()
        else:
            projects = json.loads(self.args.json)
        # enter data in the database
        insert_projects(self.session, projects)


# $ python -m asreview auth-tool add-users -i --db-path ~/.asreview/asreview.development.sqlite
# $ python -m asreview auth-tool add-users -j "[{\"email\": \"c.s.kaandorp10@uu.nl\", \"name\": \"Casper Kaandoro\", \"affiliation\": \"\", \"password\": \"123#ABcd\"}]" --db-path ~/.asreview/asreview.development.sqlite

# $ python -m asreview auth-tool list-projects
# $ python -m asreview auth-tool list-projects -j

# $ python -m asreview auth-tool link-projects -i --db-path ~/.asreview/asreview.development.sqlite
# $ python -m asreview auth-tool link-projects -j "[]" --db-path ~/.asreview/asreview.development.sqlite
