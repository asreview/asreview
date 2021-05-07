import logging
import os

from flask_httpauth import HTTPBasicAuth
from werkzeug.security import generate_password_hash, check_password_hash

auth = HTTPBasicAuth()

def init_auth(auth_file=None):
    users = {}
    if auth_file and os.path.isfile(auth_file):
        try:
            with open(auth_file, 'r') as af:
                users = {line[:line.index(':')]: line[line.index(':')+1:].strip() for line in af}
            if not len(users):
                logging.debug('No users found in auth file, no auth will be enabled.')
        except Exception as e:
            logging.error('Error reading auth file, no auth will be enabled.')

    @auth.verify_password
    def verify_password(username, password):
        if len(users) == 0:
            return 'anon'
        if username in users and \
                check_password_hash(users[username], password):
            return username