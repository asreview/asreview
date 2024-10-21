import argparse

from asreview.webapp.task_manager.task_manager import setup_logging
from asreview.webapp.task_manager.task_manager import TaskManager


def main(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")
    args = parser.parse_args(argv)

    setup_logging(verbose=args.verbose)

    manager = TaskManager()
    manager.start_manager()
