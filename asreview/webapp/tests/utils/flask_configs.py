from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# get unauthenticated configuration file
def get_unauth_config():
    path = BASE_DIR / "data" / "no_auth_config.json"
    return str(path)


# get basic authenticated configuration file, no verification
def get_basic_auth_config():
    path = BASE_DIR / "data" / "basic_auth_config.json"
    return str(path)
