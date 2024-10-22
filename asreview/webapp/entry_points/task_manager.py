import argparse

from asreview.webapp.task_manager.task_manager import setup_logging
from asreview.webapp.task_manager.task_manager import DEFAULT_TASK_MANAGER_HOST
from asreview.webapp.task_manager.task_manager import DEFAULT_TASK_MANAGER_PORT
from asreview.webapp.task_manager.task_manager import DEFAULT_TASK_MANAGER_WORKERS
from asreview.webapp.task_manager.task_manager import TaskManager

def _arg_parser(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )

    parser.add_argument(
        "--workers",
        default=DEFAULT_TASK_MANAGER_WORKERS,
        type=int,
        help="Number of workers"
    )

    parser.add_argument(
        "--host",
        default=DEFAULT_TASK_MANAGER_HOST,
        type=str,
        help="Host of task manager."
    )

    parser.add_argument(
        "--port",
        default=DEFAULT_TASK_MANAGER_PORT,
        type=int,
        help="Port of task manager."
    )

    return parser.parse_args(argv)


def main(argv):
    args = _arg_parser(argv)

    setup_logging(verbose=args.verbose)

    manager = TaskManager(
        max_workers=args.workers,
        host=args.host,
        port=args.port
    )
    manager.start_manager()
