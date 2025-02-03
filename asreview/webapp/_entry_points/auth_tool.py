__all__ = ["AuthTool"]

import argparse
import json
import os
import sys
from argparse import RawTextHelpFormatter
from uuid import UUID

from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

import asreview as asr
from asreview.webapp._authentication.models import Project
from asreview.webapp._authentication.models import User
from asreview.webapp._authentication.models import create_database_and_tables
from asreview.webapp.utils import asreview_path

DEFAULT_DATABASE_URI = f"sqlite:///{str(asreview_path())}/asreview.production.sqlite"

DB_URI_HELP = (
    "URI of the database. By default, the value is given by the environment "
    "variable ASREVIEW_LAB_SQLALCHEMY_DATABASE_URI. If not set, the default "
    "is 'asreview.production.sqlite' in the ASReview folder."
)


def auth_parser():
    parser = argparse.ArgumentParser(
        prog="auth-tool",
        description="""
Tool to create and fill a database to authenticate the ASReview application.
The tool can be used to convert existing project data to be used in an
authenticated setup.
        """,
        formatter_class=RawTextHelpFormatter,
        epilog="Use -h or --help on all subcommands to view the available options.",
    )

    sub_parser = parser.add_subparsers(help="The following options are available:")

    # CREATE DB
    create_db_par = sub_parser.add_parser(
        "create-db",
        help="Create the database necessary to authenticate the ASReview app.",
    )

    create_db_par.add_argument(
        "-d",
        "--db-uri",
        type=str,
        default=None,
        help=DB_URI_HELP,
    )

    # ADD USERS
    user_par = sub_parser.add_parser("add-users", help="Add users into the database.")

    user_par.add_argument(
        "-d",
        "--db-uri",
        type=str,
        default=None,
        help=DB_URI_HELP,
    )

    user_par.add_argument(
        "-j",
        "--json",
        type=str,
        help="JSON string that contains a list with user account data.",
    )

    # RESET PASSWORD USER
    user_reset_password_par = sub_parser.add_parser(
        "reset-password", help="Reset password of a single user account."
    )

    user_reset_password_par.add_argument(
        "-d",
        "--db-uri",
        type=str,
        default=None,
        help=DB_URI_HELP,
    )

    # LIST USERS
    list_users_par = sub_parser.add_parser(
        "list-users",
        help="List user accounts.",
    )

    list_users_par.add_argument(
        "-d",
        "--db-uri",
        type=str,
        default=None,
        help=DB_URI_HELP,
    )

    # LIST PROJECTS
    list_projects_par = sub_parser.add_parser(
        "list-projects",
        help="List project info from all projects in the ASReview folder.",
    )

    list_projects_par.add_argument(
        "-j",
        "--json",
        action="store_true",
        help="Create JSON string to connect existing projects with users.",
    )

    # LINK PROJECTS TO USERS
    link_par = sub_parser.add_parser(
        "link-projects", help="Link projects to user accounts."
    )

    link_par.add_argument(
        "-j",
        "--json",
        type=str,
        help="Use a JSON string to link projects to users.",
    )

    link_par.add_argument(
        "-d",
        "--db-uri",
        type=str,
        default=None,
        help=DB_URI_HELP,
    )

    return parser


def verify_id(id):
    try:
        UUID(id)
        return True
    except ValueError:
        return False


def insert_user(session, entry):
    """Inserts a dictionary containing user data
    into the database."""
    # create a user object
    user = User(
        entry["email"].lower(),
        email=entry["email"].lower(),
        name=entry["name"],
        affiliation=entry["affiliation"],
        password=entry["password"],
        confirmed=True,
    )
    try:
        session.add(user)
        session.commit()
        print(f"User with email {user.email} created.")
        return True
    except IntegrityError:
        session.rollback()
        sys.stderr.write(f"User with identifier {user.email} already exists")
        return False


def insert_project(session, project):
    # get owner and project id
    owner_id = project["owner_id"]
    project_id = project["project_id"]

    # check if this project was already in the database under
    # the old project id
    db_project = (
        session.query(Project).filter(Project.project_id == project_id).one_or_none()
    )
    if db_project is None:
        # create new record
        session.add(Project(owner_id=owner_id, project_id=project_id))
    else:
        # update record (project_id must be the same)
        db_project.owner_id = owner_id
    # commit
    session.commit()
    print("Project data is stored.")
    return True


def get_users(session):
    return session.query(User).all()


def get_user_by_id(session, user_id):
    return session.query(User).filter_by(id=user_id).one()


class AuthTool:
    def execute(self, argv):
        parser = auth_parser()
        args = parser.parse_args(argv)

        self.args = args
        self.argv = argv

        # create a conn object for the database if needed (database
        # is not needed when the only command is "list-projects", all
        # other commands need a database session)
        if self.argv != ["list-projects"]:
            self.uri = (
                getattr(self.args, "db_uri", False)
                or os.environ.get("SQLALCHEMY_DATABASE_URI", False)
                or os.environ.get("ASREVIEW_LAB_SQLALCHEMY_DATABASE_URI", False)
                or DEFAULT_DATABASE_URI
            )
            Session = sessionmaker()
            engine = create_engine(self.uri)
            Session.configure(bind=engine)
            self.session = Session()

        if "create-db" in argv:
            self.create_database()
        elif "add-users" in argv:
            self.add_users()
        elif "reset-password" in argv:
            self.reset_password()
        elif "list-users" in argv:
            self.list_users()
        elif "list-projects" in argv:
            self.list_projects()
        elif "link-projects" in argv:
            self.link_projects()

    def create_database(self):
        engine = create_engine(self.uri)
        create_database_and_tables(engine)
        print(f"...Database created, URI: {self.uri}")

    def add_users(self):
        if self.args.json is not None:
            entries = json.loads(self.args.json)
            # try to insert entries into the database
            for entry in entries:
                insert_user(self.session, entry)
        else:
            self.enter_users()

    def reset_password(self):
        """Resets password for a user."""
        # get user accounts
        user_ids = [u.id for u in get_users(self.session)]
        print("\nReset password of:")
        self.list_users()
        # get user id
        id = self._ensure_valid_value_for(
            "Id of user account",
            lambda x: x.isnumeric() and int(x) in user_ids,
            hint="Id number must be a number and exist.",
        )
        # get new password, since this is not hidden I don't see
        # the point of confirmation
        password = self._ensure_valid_value_for(
            "New password",
            User.valid_password,
            "Use 8 or more characters with a mix of letters, numbers & symbols.",  # noqa
        )
        # id and password are guaranteed, get user and reset password
        user = get_user_by_id(self.session, int(id))
        user.reset_password(password)
        self.session.commit()
        print(f"Password of {user.name} has been reset.")

    def _ensure_valid_value_for(self, name, validation_function, hint=""):
        """Prompt user for validated input."""
        while True:
            value = input(f"{name}: ")
            if validation_function(value):
                return value
            else:
                sys.stderr.write(hint + "\n")

    def enter_users(self):
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

                insert_user(
                    self.session,
                    {
                        "email": email,
                        "name": name,
                        "affiliation": affiliation,
                        "password": password,
                    },
                )
            else:
                break

        return True

    def _print_project(self, project):
        print(f"\n* {project['folder']}")
        print(f"\tversion: {project['version']}")
        print(f"\tid: {project['project_id']}")
        print(f"\tname: {project['name']}")
        print(f"\tauthors: {project['authors']}")
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
            project = asr.Project(folder)

            # Raise a RuntimeError if the project version is too low.
            if project.config.get("version").startswith("0."):
                id = project.config.get("id")
                message = f"""Version of project with id {id} is too old,
                please upgrade first before using this tool."""
                raise RuntimeError(message)

            result.append(
                {
                    "folder": folder.name,
                    "version": project.config.get("version"),
                    "project_id": project.config.get("id"),
                    "name": project.config.get("name"),
                    "authors": project.config.get("authors"),
                    "created": project.config.get("created_at_unix"),
                    "owner_id": 0,
                }
            )
        return result

    def list_users(self):
        users = get_users(self.session)
        print()
        for user in users:
            self._print_user(user)
        print()

    def list_projects(self):
        projects = self._get_projects()
        if self.args.json:
            # dump the data twice to create a string
            # that can be loaded again by the tool.
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
                    if isinstance(id, str):
                        id = id.replace(".", "")
                    id = int(id)
                    if id not in user_ids:
                        print("Entered ID does not exists, try again.")
                    else:
                        insert_project(
                            self.session,
                            {"project_id": project["project_id"], "owner_id": id},
                        )
                        break
                except ValueError:
                    sys.stderr.write("Entered ID is not a number, please try again.")
        return result

    def link_projects(self):
        # bulk JSON vs interactive
        if self.args.json is not None:
            projects = json.loads(self.args.json)
            # enter data in the database
            for project in projects:
                insert_project(self.session, project)
        else:
            self._generate_project_links()
