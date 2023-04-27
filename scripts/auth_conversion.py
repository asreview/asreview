# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import argparse
import json
import sqlite3
from argparse import RawTextHelpFormatter
from pathlib import Path

from asreview.utils import asreview_path
from asreview.webapp.api.projects import _get_project_uuid
from asreview.webapp.authentication.models import User


def get_users(conn):
    """Select ids, names and emails from all users"""
    qry = """SELECT id, email, name FROM users"""
    cursor = conn.cursor()
    cursor.execute(qry)
    result = []
    for u in cursor.fetchall():
        user = User(u[1], name=u[2], email=u[1])
        user.id = u[0]
        result.append(user)
    return result


def print_user_records(users):
    """Print user records from database."""
    if not bool(users):
        return "No records."
    print("ID\tname (email)")
    print("==============================")
    for user in users:
        print(f"{user.id}.\t{user.name} ({user.email})")


def user_project_link_exists(conn, folder_id):
    """Check if a project record already exists."""
    query = "SELECT COUNT(id) FROM projects " + f"WHERE project_id='{folder_id}'"
    cursor = conn.cursor()
    cursor.execute(query)
    return cursor.fetchone()[0] == 1


def link_user_to_project(conn, project_id, user_id):
    """Inserts project record, links user id to project"""
    query = "INSERT INTO projects(project_id, owner_id)" + "VALUES(?,?)"
    cursor = conn.cursor()
    cursor.execute(query, (project_id, user_id))
    conn.commit()
    return True


def main(conn, mapping=[]):
    # keep track of made links
    done = []
    # get all user ids
    users = get_users(conn)
    # user cache to speed things up ;)
    user_cache = {user.id: user for user in users}
    # user ids
    user_ids = list(user_cache.keys())

    # loop over links
    for link in mapping:
        if link not in done:
            user_id = link["user_id"]
            project_id = link["project_id"]

            # see if this project is already connected to a user
            if user_project_link_exists(conn, project_id):
                print(f"Project {project_id} is already linked to a user")
                continue

            else:
                try:
                    # make sure user id exists
                    assert user_id in user_ids

                    # get user record
                    user = user_cache[user_id]

                    # create a new project_id
                    new_project_id = _get_project_uuid(project_id, user.id)

                    # rename the folder
                    folder = asreview_path() / project_id
                    folder.rename(asreview_path() / new_project_id)

                    # take care of the id inside the project.json file
                    with open(
                        asreview_path() / new_project_id / "project.json", mode="r"
                    ) as f:
                        data = json.load(f)
                        # change id
                        data["id"] = new_project_id

                    # overwrite original project.json file with new project id
                    with open(
                        asreview_path() / new_project_id / "project.json", mode="w"
                    ) as f:
                        json.dump(data, f)

                    # insert record
                    link_user_to_project(
                        conn,
                        new_project_id,
                        user_id,
                    )

                    # add to the done bucket
                    done.append(link)

                except AssertionError:
                    print(f"User id {user_id} does not exists.")
                    break


if __name__ == "__main__":

    desc = """
    This script helps to convert your non authenticated ASReview application
    into an authenticated version. When you would like to start using 
    authentication you need to assign all existing projects in the dedicated
    ASReview folder to individual users.

    In the authenticated version of the app the link between a user and a
    project is established in a slqite database. The database is created when
    you start the authenticated application for the first time. It needs to
    know 
    
    The script has 2 tools
    """

    parser = argparse.ArgumentParser(
        description=desc,
        formatter_class=RawTextHelpFormatter
    )
    sub_parser = parser.add_subparsers(
        help="Choose between listing the projects " +
            "or "
    )

    list_par = sub_parser.add_parser(
        "list",
        help="List project info from all projects in the ASReview folder."
    )

    action_par = sub_parser.add_parser(
        "link_projects",
        help="Prepare ASReview to run in authenticated mode."
    )

    action_par = sub_parser.add_parser(
        "add_users",
        help="Add users into the database."
    )

    action_par.add_argument(
        "-d",
        "--db-path",
        type=str,
        help="Absolute path to sqlite database.",
        required=True,
    )

    group = action_par.add_mutually_exclusive_group()
    group.add_argument(
        "-i",
        "--interactive",
        action="store_true",
        help="Interactively link projects to users.",
    )
    group.add_argument(
        "-s",
        "--schema",
        type=str,
        default="[]",
        help="JSON that links projects to user ids.",
    )

    args = parser.parse_args()
    print(args)
    

    # # establish connect with database
    # conn = sqlite3.connect(asreview_path() / args.database_path)
    # # get all users in the user table
    # users = get_users(conn)

    # # set up a mapping dictionary which links users with projects
    # mapping = []
    # # iterate over all files and folders in asreview_path()
    # for folder in asreview_path().glob("*"):
    #     # if folder is indeed a folder
    #     if Path(folder).is_dir():
    #         # open the project.json folder
    #         with open(folder / "project.json") as json_file:
    #             project_data = json.load(json_file)
    #         # get project id
    #         project_id = project_data["id"]

    #         # show all users and their ids and ask who's the owner
    #         print("\n\n==> Who is the owner of this project folder:", f"{project_id}")
    #         print_user_records(users)
    #         # ask who's the folder's owner
    #         user_id = input("Provide ID number of owner > ")
    #         user_id = user_id.replace(".", "")

    #         try:
    #             # convert to integer
    #             user_id = int(user_id)

    #             # add pair to the mapping
    #             mapping.append({"user_id": user_id, "project_id": project_id})

    #         except ValueError:
    #             print("Entered input is not a string, start again.")
    #             break

    # print(mapping)
    # # send mapping to main to do the linking
    # main(conn, mapping)

    print("done.")
