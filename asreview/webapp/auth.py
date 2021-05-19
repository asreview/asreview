import logging
import os

from flask_httpauth import HTTPBasicAuth
from werkzeug.security import generate_password_hash, check_password_hash

from asreview.entry_points.auth import _auth_parser
from asreview.webapp.utils.paths import get_auth_file_path

userpwd_delimiter = "|"

auth = HTTPBasicAuth()

def init_auth(auth_file=None):
    users = {}

    if not auth_file:
        auth_file = get_auth_file_path()

    if auth_file and os.path.isfile(auth_file):
        try:
            users = get_users_from_file(auth_file)
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

def get_users_from_file(fp, delimiter=userpwd_delimiter):
    """ Get the dictionary of username:hash_string in the file.
        Global variable user_pass_delimiter is used to split
        the lines of the file into user name and hash string.
    
    Args:
        fp (string): Path to the authentication file.
        delimiter (string): String which is used to delimit user name and
            password hash string in the file.

    Returns:
        dict: Dictionary, where keys are user names and values are the
            hash strings of their passwords.
    """
    with open(fp, 'r') as f:
        try:
            users = [l.strip().split(delimiter) for l in f]
            users = {key: value for key, value in users}
        except Exception as e:
            raise Exception("Could not read the users. Check for possible corruptions " +
                "(e.g. ensure that delimiter is '%s')." % delimiter)

    return users

def write_auth_file(users, fp, delimiter=userpwd_delimiter):
    """ Write the dictionary of user names and hash strings to the file.

    Args:
        users (dict): Dictionary, where keys are user names and values are the
            hash strings of their passwords.
        fp (string): Path to the authentication file.
        delimiter (string): String which is used to delimit user name and
            password hash string in the file.

    Returns:
        None
    """

    lines = ['%s%s%s\n' % (user, delimiter, pwd) for user, pwd in users.items()]
    with open(fp, 'w') as f:
        f.writelines(lines)

def cmd_tool(argv):
    parser = _auth_parser()
    args = parser.parse_args(argv)

    try:
        if args.file:
            fp = args.file
        else:
            fp = get_auth_file_path()

        # Create file if does not exist
        if not os.path.isfile(fp):
            with open(fp, 'w'):
                print('Creating auth file at: %s' % fp)

        users = get_users_from_file(fp)
        if args.remove:
            if args.user in users:
                del users[args.user]
                write_auth_file(users, fp)
                print('Removed user %s. Users in the file: %d.' % (args.user, len(users)))
            else:
                print('No user %s found to delete.' % args.user)
        elif args.pwd:
            if args.user in users:
                print('User %s is already in the file. Changing the password...' % args.user)
            method = 'pbkdf2:sha256:%d' % args.iterhash
            users[args.user] = generate_password_hash(args.pwd, salt_length=args.saltlen,
                                    method=method)
            write_auth_file(users, fp)
            print('Done writing password for user %s! Users in the file: %d.' % (args.user, len(users)))
        else:
            print('No password specified. Use -p USER_PWD to set the password.')
    except Exception as e:
        print('Error while reading the file: ', e)
