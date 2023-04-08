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
from pathlib import Path

from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.api.projects import _get_authenticated_folder_id
from asreview.webapp.authentication.models import Project, User


DATABASE_NAME = "asreview.development.sqlite"


def get_users():
    """Select ids, names and emails from all users"""
    return User.query.all()


def print_user_records(selection):
    """Print user records from database."""
    if not bool(selection):
        return "No records."
    print("ID\tname (email)")
    print("==============================")
    for id, name, email in selection:
        print(f"{id}.\t{name} ({email})")


def user_project_link_exists(folder_id):
    """Check if a project record already exists."""
    project = Project.query.filter(Project.project_id == folder_id).first()
    return bool(project)


def link_user_to_project(project_id, user_id):
    """Inserts project record, links user id to project"""
    new_project = Project(project_id=project_id, owner_id=user_id)
    DB.session.add(new_project)
    DB.session.commit()
    return True


def main(mapping=[]):
    # keep track of made links
    done = []
    # get all user ids
    users = get_users()
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
            if user_project_link_exists(project_id):
                print(f"Project {project_id} is already linked to a user")
                continue

            else:
                try:
                    # make sure user id exists
                    assert user_id in user_ids

                    # get user record
                    user = user_cache[user_id]

                    # create a new project_id
                    new_project_id = _get_authenticated_folder_id(
                        project_id,
                        user
                    )

                    # rename the folder
                    folder = asreview_path() / project_id
                    folder.rename(asreview_path() / new_project_id)

                    # take care of the id inside the project.json file
                    with open(
                        asreview_path() / new_project_id / "project.json",
                        mode="r"
                    ) as f:
                        data = json.load(f)
                        # change id
                        data["id"] = new_project_id

                    # overwrite original project.json file with new project id
                    with open(
                        asreview_path() / new_project_id / "project.json",
                        mode="w"
                    ) as f:
                        json.dump(data, f)

                    # insert record
                    link_user_to_project(
                        new_project_id,
                        user_id,
                    )

                    # add to the done bucket
                    done.append(link)

                except AssertionError:
                    print(f"User id {user_id} does not exists.")
                    break


if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "-i",
        "--interactive",
        action="store_true",
        help="Interactively link projects to users."
    )
    group.add_argument(
        "-s",
        "--schema",
        type=str,
        default='[]',
        help="JSON that links projects to user ids."
    )
    parser.add_argument(
        "-d",
        "--database-path",
        type=str,
        help='Path to sqlite database.',
        required=True
    )
    args = parser.parse_args()

    # establish connect with database
    conn = sqlite3.connect(asreview_path() / DATABASE_NAME)
    # get all users in the user table
    users = get_users()

    # set up a mapping dictionary which links users with projects
    mapping = []
    # iterate over all files and folders in asreview_path()
    for folder in asreview_path().glob("*"):

        # if folder is indeed a folder
        if Path(folder).is_dir():
            # open the project.json folder
            with open(folder / "project.json") as json_file:
                project_data = json.load(json_file)
            # get project id
            project_id = project_data["id"]

            # show all users and their ids and ask who's the owner
            print(
                "==> Who is the owner of this project folder:",
                f"{project_id}\n"
            )
            print_user_records(users)
            # ask who's the folder's owner
            user_id = input("Provide ID number of owner > ")
            user_id = user_id.replace(".", "")

            try:
                # convert to integer
                user_id = int(user_id)

                # add pair to the mapping
                mapping.append({
                    'user_id': user_id,
                    'project_id': project_id
                })

            except ValueError:
                print("Entered input is not a string, start again.")
                break

    # send mapping to main to do the linking
    main(mapping)

    print("done.")
