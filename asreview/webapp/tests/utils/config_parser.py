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
    user = User(
        section["email"],
        email=section["email"],
        name=section["name"],
        affiliation=section["affiliation"],
        password=section["password"],
    )
    return user

# # get basic app configuration
# def get_test_app_config():
#     section = config["basic_config"]
#     return {
#         "TESTING": section.getboolean("testing"),
#         "DEBUG": section.getboolean("debug")
#     }


# # get unauthenticated configuration
# def get_unauth_config():
#     conf = get_test_app_config()
#     conf["AUTHENTICATION_ENABLED"] = False
#     return conf


# # get basic authenticated configuration, no verification
# def get_basic_auth_config():
#     conf = get_test_app_config()
#     section = config["config_auth"]
#     additionals = {
#         "AUTHENTICATION_ENABLED":
#             section.getboolean("AUTHENTICATION_ENABLED"),
#         "SECRET_KEY": section["SECRET_KEY"],
#         "SECURITY_PASSWORD_SALT": section["SECURITY_PASSWORD_SALT"]
#     }
#     return conf | additionals

