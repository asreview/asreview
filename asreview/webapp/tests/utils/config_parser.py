import configparser
from pathlib import Path

from asreview.webapp.authentication.models import User

config_file = "asreview.ini"
config_dir = "config"

config = configparser.ConfigParser()
BASE_DIR = Path(__file__).resolve().parent.parent

CONFIG_FILE = BASE_DIR.joinpath(config_dir).joinpath(config_file)

config.read(CONFIG_FILE)

# get user (1 of 3)
def get_user(id):
    section = config[f"user{id}"]
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
