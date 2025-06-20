import argparse
import os
import textwrap

from asreview.webapp._task_manager.task_manager import DEFAULT_TASK_MANAGER_HOST
from asreview.webapp._task_manager.task_manager import DEFAULT_TASK_MANAGER_PORT
from asreview.webapp._task_manager.task_manager import DEFAULT_TASK_MANAGER_WORKERS
from asreview.webapp._task_manager.task_manager import run_task_manager

description = """\
This entry point launches an instance of ASReview's task manager. You can
specify the host, port, and number of workers using environment variables
(ASREVIEW_LAB_TASK_MANAGER_[WORKERS|HOST|PORT]) or CLI parameters, with
environment variables taking precedence.
"""


def main(argv):
    parser = argparse.ArgumentParser(description=textwrap.dedent(description).strip())
    parser.add_argument(
        "-v",
        "--verbose",
        action="count",
        default=0,
        help="Increase output verbosity. -v for INFO, -vv for DEBUG.",
    )
    parser.add_argument(
        "--workers",
        default=DEFAULT_TASK_MANAGER_WORKERS,
        type=int,
        help=f"Specify the number of workers, defaults to {DEFAULT_TASK_MANAGER_WORKERS}.",
    )
    parser.add_argument(
        "--host",
        default=DEFAULT_TASK_MANAGER_HOST,
        type=str,
        help=f"Specify the task manager's host, defaults to {DEFAULT_TASK_MANAGER_HOST}.",
    )
    parser.add_argument(
        "--port",
        default=DEFAULT_TASK_MANAGER_PORT,
        type=int,
        help=f"Port of task manager, defaults to {DEFAULT_TASK_MANAGER_PORT}.",
    )
    args = parser.parse_args(argv)

    run_task_manager(
        max_workers=os.getenv("ASREVIEW_LAB_TASK_MANAGER_WORKERS", args.workers),
        host=os.getenv("ASREVIEW_LAB_TASK_MANAGER_HOST", args.host),
        port=os.getenv("ASREVIEW_LAB_TASK_MANAGER_PORT", args.port),
        verbose=int(os.getenv("ASREVIEW_LAB_TASK_MANAGER_VERBOSE", args.verbose)),
    )
