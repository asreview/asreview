import json
import sqlite3
from pathlib import Path
from uuid import NAMESPACE_URL
from uuid import uuid5

ASREVIEW_PATH = Path("/Users/casperkaandorp/.asreview")
DATABASE_NAME = "asreview.development.sqlite"


def get_users(cursor):
    """Select ids, names and emails from all users"""
    query = "SELECT id, name, email FROM users"
    cursor.execute(query)
    return cursor.fetchall()


def print_user_records(selection):
    """Print user records from database."""
    if not bool(selection):
        return "No records."
    print("ID\tname (email)")
    print("==============================")
    for id, name, email in selection:
        print(f"{id}.\t{name} ({email})")


def user_project_link_exists(cursor, folder_id):
    """Check if a project record already exists."""
    query = "SELECT COUNT(id) FROM projects " + \
        f"WHERE project_id='{folder_id}'"
    cursor.execute(query)
    return cursor.fetchone()[0] == 1


def link_user_to_project(conn, project_id, folder_name, user_id):
    """Inserts project record, links user id to project"""
    query = "INSERT INTO projects(project_id, folder, owner_id)" + \
        "VALUES(?,?,?)"
    cursor = conn.cursor()
    cursor.execute(query, (project_id, folder_name, user_id))
    conn.commit()
    return cursor.lastrowid


if __name__ == "__main__":
    # establish connect with database
    con = sqlite3.connect(ASREVIEW_PATH / DATABASE_NAME)
    # get cursor
    cursor = con.cursor()
    # get all users in the user table
    users = get_users(cursor)
    # all id numbers
    all_ids = [row[0] for row in users]

    # iterate over all files and folders in ASREVIEW_PATH
    for folder in ASREVIEW_PATH.glob("*"):

        # if folder is indeed a folder
        if Path(folder).is_dir():
            # open the project.json folder
            with open(folder / "project.json") as json_file:
                project_data = json.load(json_file)
            # get project id
            project_id = project_data["id"]
            # see if this project is already connected to a user
            if user_project_link_exists(cursor, project_id):
                print(f"Project {project_id} is already linked to a user")
                continue
            else:
                print(
                    "==> Who is the owner of this project folder:",
                    f"{project_id}\n"
                )
                print_user_records(users)
                # ask who's the folder's owner
                user_id = input("Provide ID number of owner > ")
                user_id = user_id.replace(".", "")

                # try to convert into id number and store project row
                try:
                    user_id = int(user_id)
                    # make sure the user_id exists
                    assert user_id in all_ids

                    # create a new project_id
                    new_project_id = f"{user_id}_{project_id}"
                    new_folder_name = uuid5(
                        NAMESPACE_URL,
                        new_project_id
                    ).hex

                    # rename the folder
                    folder.rename(ASREVIEW_PATH / new_folder_name)

                    # insert record
                    link_user_to_project(
                        con,
                        project_id,
                        new_folder_name,
                        user_id,
                    )

                except AssertionError:
                    print("Entered user id does not exists, start again.")
                    break

                except ValueError:
                    print("Entered input is not a string, start again.")
                    break
