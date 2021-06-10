import logging
import os

from flask_httpauth import HTTPBasicAuth
from werkzeug.security import generate_password_hash, check_password_hash
from getpass import getpass

from asreview.entry_points.auth import _auth_parser
from asreview.webapp.utils.paths import get_auth_file_path


class ASReviewAuth(HTTPBasicAuth):
    USERPWD_DELIMITER = '|'
    ANONYMOUS_USERNAME = 'anon'

    def __init__(self, auth_file=None, scheme=None, realm=None):
        super().__init__(scheme=scheme, realm=realm)

        self.reinit(auth_file)


    def reinit(self, auth_file):
        self.auth_file = auth_file

        if not auth_file:
            self.auth_file = get_auth_file_path()
            logging.info('No valid auth file path was passed at the start of ASReview. ' +
                         'Looking at default path %s.' % self.auth_file)

        self.users = {}
        if self.auth_file and os.path.isfile(self.auth_file):
            try:
                self.users = self.users_from_file
            except Exception as e:
                logging.error(e)
                logging.error('Error reading auth file, no auth will be enabled.')

        if not len(self.users):
            logging.debug('No users found in auth file, no auth will be enabled.')
            self.enabled = False
        else:
            self.enabled = True
                

        @self.verify_password
        def verify_userpwd(username, password):
            if not self.enabled:
                return ASReviewAuth.ANONYMOUS_USERNAME
            
            if username in self.users and \
                check_password_hash(self.users[username], password):
                
                return username

    @property
    def users_from_file(self):
        """ Instance method of getting the users from the auth file. """

        return ASReviewAuth.get_users_from_file(self.auth_file)


    @staticmethod
    def get_users_from_file(fp, delimiter=None):
        """ Get the dictionary of username:hash_string in the file.
        
        Args:
            fp (string): Path to the authentication file.
            delimiter (string): String which is used to delimit user name and
                password hash string in the file.

        Returns:
            dict: Dictionary, where keys are user names and values are the
                hash strings of their passwords.
        """
        if delimiter is None:
            delimiter = ASReviewAuth.USERPWD_DELIMITER

        try:
            with open(fp, 'r') as f:
                users = [l.strip().split(delimiter) for l in f]
                users = {key: value for key, value in users}

            return users

        except Exception as e:
            raise Exception("Could not read the users. Check for possible corruptions " +
                "(e.g. ensure that delimiter is '%s')." % delimiter)


    @staticmethod
    def write_auth_file(users, fp, delimiter=None):
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

        if delimiter is None:
            delimiter = ASReviewAuth.USERPWD_DELIMITER

        lines = ['%s%s%s\n' % (user, delimiter, pwd) for user, pwd in users.items()]
        with open(fp, 'w') as f:
            f.writelines(lines)


    @staticmethod
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

            users = ASReviewAuth.get_users_from_file(fp)
            if args.remove:
                if args.user in users:
                    del users[args.user]
                    ASReviewAuth.write_auth_file(users, fp)
                    print('Removed user %s. Number of users in the file: %d.' % (args.user, len(users)))
                else:
                    print('No user %s found to delete.' % args.user)
            else:
                pwd = args.pwd
                while not pwd:
                    pwd = getpass('Password: ')

                if args.user in users:
                    print('User %s is already in the file. Changing the password...' % args.user)
                method = 'pbkdf2:sha256:%d' % args.iterhash
                users[args.user] = generate_password_hash(pwd, salt_length=args.saltlen,
                                        method=method)
                ASReviewAuth.write_auth_file(users, fp)
                print('Done writing password for user %s! Number of users in the file: %d.' % (args.user, len(users)))

        except Exception as e:
            print('Error while reading the file: ', e)

auth = ASReviewAuth()