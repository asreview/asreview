from argparse import ArgumentParser

from asreview.entry_points.base import BaseEntryPoint

def _auth_parser(prog="auth"):
    parser = ArgumentParser(
        prog=prog,
        description="""ASReview LAB - Active learning for Systematic Reviews. Authentication management util."""
    )

    parser.add_argument("-f", 
        "--file", 
        help="Path to the auth file", 
        required=False
    )

    parser.add_argument("-u", 
        "--user", 
        help="User name", 
        required=True
    )

    parser.add_argument("-p", 
        "--pwd", 
        help="Password"
    )

    parser.add_argument("-r", 
        "--remove", 
        help="Remove user", 
        action='store_true'
    )

    parser.add_argument("-s", 
        "--saltlen", 
        help="Length of the salt string", 
        type=int, 
        default=64
    )

    parser.add_argument("-i", 
        "--iterhash", 
        help="Number of hashing iterations", 
        type=int, 
        default=150000
    )

    return parser


class AuthEntryPoint(BaseEntryPoint):
    description = "Authentication management util for ASReview."

    def execute(self, argv):

        from asreview.webapp.auth import cmd_tool

        cmd_tool(argv)
