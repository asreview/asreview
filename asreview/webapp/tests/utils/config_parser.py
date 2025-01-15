import configparser
from pathlib import Path

from asreview.webapp._authentication.models import User

config_file = "asreview.ini"
config_dir = "config"

config = configparser.ConfigParser()
BASE_DIR = Path(__file__).resolve().parent.parent

CONFIG_FILE = BASE_DIR.joinpath(config_dir).joinpath(config_file)

config.read(CONFIG_FILE)


# get user (1 of 3)
def get_user(test_user_id):
    """Returns a User model based on a test user
    account that can be found in the config file.
    The test_user_id refers to the position of the
    user account credentials in the .ini file
    (1, 2, or 3)"""
    section = config[f"user{test_user_id}"]
    # create user
    user = User(
        section["email"],
        email=section["email"],
        name=section["name"],
        affiliation=section["affiliation"],
        password=section["password"],
    )
    # store password
    user.password = section["password"]
    return user


def get_user_data(test_user_id):
    """Returns the data for a user account as a
    dictionary."""
    section = config[f"user{test_user_id}"]
    return {
        "email": section["email"],
        "name": section["name"],
        "affiliation": section["affiliation"],
        "password": section["password"],
    }


# get all users
def all_users():
    """Returns a dictionary containing User models,
    the keys are identifiers in the .ini file."""
    users = [get_user(id) for id in [1, 2, 3]]
    return {u.identifier: u for u in users}
