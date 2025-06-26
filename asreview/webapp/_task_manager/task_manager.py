import json
import logging
import multiprocessing as mp
import socket
import threading
import signal
import errno
from collections import deque

from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from asreview.webapp import asreview_path
from asreview.webapp._task_manager.models import Base
from asreview.webapp._task_manager.models import ProjectQueueModel
from asreview.webapp._tasks import run_task

DEFAULT_TASK_MANAGER_HOST = "localhost"
DEFAULT_TASK_MANAGER_PORT = 5101
DEFAULT_TASK_MANAGER_WORKERS = 2

# Set up a module-level logger for the task manager
logger = logging.getLogger("asreview.task_manager")


def _setup_logging(verbose=0):
    """Set up logging for the task manager."""

    # Determine log level from verbosity count
    if verbose >= 2:
        log_level = "DEBUG"
    elif verbose == 1:
        log_level = "INFO"
    else:
        log_level = None

    if log_level is not None:
        numeric_level = getattr(logging, log_level.upper(), None)
        if not isinstance(numeric_level, int):
            raise ValueError(f"Invalid log level: {log_level}")

        logger.setLevel(numeric_level)

    logger.propagate = False
    logger.handlers.clear()

    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(levelname)s:%(name)s:%(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)


class RunModelProcess(mp.Process):
    def __init__(
        self,
        func,
        args=(),
        host=DEFAULT_TASK_MANAGER_HOST,
        port=DEFAULT_TASK_MANAGER_PORT,
    ):
        super().__init__()
        self.func = func
        self.args = args
        self.host = host
        self.port = port

    def run(self):
        _setup_logging(verbose=1)
        payload = {"action": "remove", "project_id": self.args[0]}
        try:
            self.func(*self.args)
        except Exception:
            payload["action"] = "failure"
        finally:
            if self.host and self.port:
                self._send_payload(payload)

    def _send_payload(self, payload):
        """Send a payload to the task manager via socket."""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
            try:
                client_socket.connect((self.host, self.port))
                client_socket.sendall(json.dumps(payload).encode("utf-8"))
            except Exception as e:
                logger.error(f"Failed to send payload: {e}")


class TaskManager:
    def __init__(
        self,
        max_workers=DEFAULT_TASK_MANAGER_WORKERS,
        host=DEFAULT_TASK_MANAGER_HOST,
        port=DEFAULT_TASK_MANAGER_PORT,
    ):
        self.pending = set()
        self.max_workers = int(max_workers)

        # set up parameters for socket endpoint
        self.host = host
        self.port = int(port)
        self.message_buffer = deque()
        self.receive_bytes = 1024  # bytes read when receiving messages
        self.timeout = 0.1  # wait for 0.1 seconds for incoming messages

        # set up database
        database_url = f"sqlite:///{asreview_path()}/queue.sqlite"
        engine = create_engine(database_url, pool_size=5, max_overflow=10)
        Base.metadata.create_all(engine)

        Session = sessionmaker(bind=engine)
        self.session = Session()
        self.client_thread = None
        self.client_conn = None

    @property
    def waiting(self):
        records = self.session.query(ProjectQueueModel).all()
        return [r.project_id for r in records]

    def insert_in_waiting(self, project_id, simulation):
        try:
            new_record = ProjectQueueModel(
                project_id=str(project_id), simulation=bool(simulation)
            )
            self.session.execute(text("BEGIN TRANSACTION"))
            self.session.add(new_record)
            self.session.commit()
        except IntegrityError:
            logger.info(f"Task for project {project_id} already in queue")
            self.session.rollback()
        except Exception:
            logger.error(f"Failed to add task for project {project_id} queue")
            self.session.rollback()
        else:
            logger.info(f"Task for project {project_id} inserted into queue")

    def is_waiting(self, project_id):
        return (
            self.session.query(ProjectQueueModel)
            .filter_by(project_id=project_id)
            .first()
            or False
        )

    def is_pending(self, project_id):
        return project_id in self.pending

    def remove_pending(self, project_id):
        if project_id in self.pending:
            self.pending.remove(project_id)
            logger.info(f"Task for project {project_id} removed from pending area")
        else:
            logger.error(
                f"Failed to find task for project {project_id} in pending area"
            )

    def move_from_waiting_to_pending(self, project_id):
        record = self.is_waiting(project_id)
        if record:
            try:
                # add to pending
                self.add_pending(project_id)
                # delete
                self.session.execute(text("BEGIN TRANSACTION"))
                self.session.delete(record)
                self.session.commit()
                logger.info(f"Task for project {project_id} moved to pending area")
            except Exception:
                self.session.rollback()
                # remove from pending
                self.remove_pending(project_id)
                logger.error(
                    f"Failed to move task for project {project_id} to pending area"
                )

    def add_pending(self, project_id):
        if project_id not in self.pending:
            self.pending.add(project_id)

    def __execute_job(self, project_id, simulation):
        try:
            # run the simulation / train task
            p = RunModelProcess(
                func=run_task,
                args=(project_id, simulation),
                host=self.host,
                port=self.port,
            )
            p.start()
            logger.info(f"Task for project {project_id} started in a subprocess")
            return True
        except Exception as _:
            message = f"Failed to spin up training process for project: {project_id}"
            logger.error(message)
            return False

    def _count_available_slots(self):
        return self.max_workers - len(self.pending)

    def pop_waiting_queue(self):
        """Moves tasks from the database and executes them in subprocess."""
        # Do we have available slots?
        if self._count_available_slots() > 0:
            # select first #max_workers records to ensure we
            # have new projects that can start training (note that
            # we can have only one record per project in the waiting
            # table, and that the same project may exist in pending).
            # If I have 3 slots available out of 8, selecting 8 records
            # ensures I will have 3 non-pending projects in the selection.
            try:
                records = (
                    self.session.query(ProjectQueueModel)
                    .order_by(ProjectQueueModel.id)
                    .limit(self.max_workers)
                    .all()
                )
            except Exception as e:
                logger.error(f"Failed to select waiting project ids: {e}")
                # just wait until the next tick
                records = []

            # loop over records
            for record in records:
                project_id = record.project_id
                simulation = record.simulation

                if project_id in self.pending:
                    # continue if this project is already in pending
                    continue
                elif self._count_available_slots() == 0:
                    # break if we have no more slots
                    break
                else:
                    # we have a slot and a new project,
                    # execute job:
                    if self.__execute_job(project_id, simulation):
                        # move out of waiting and put into pending
                        self.move_from_waiting_to_pending(project_id)

    def _process_buffer(self):
        """Injects messages in the database."""
        while self.message_buffer:
            message = self.message_buffer.popleft()
            action = message.get("action", False)
            project_id = message.get("project_id", False)
            simulation = message.get("simulation", False)

            if action == "insert" and project_id:
                # This will insert into the waiting database if
                # the project isn't there, it will fail gracefully
                # if the project is already waiting
                self.insert_in_waiting(project_id, simulation)

            elif action in ["remove", "failure"] and project_id:
                if action == "failure":
                    logger.error(f"Failed to train model for project {project_id}")
                self.remove_pending(project_id)

    def _handle_incoming_messages(self, conn):
        """Handles incoming traffic."""
        client_buffer = ""
        while True:
            try:
                data = conn.recv(self.receive_bytes)
                logger.debug(f"{data}")
                if not data:
                    # if client_buffer is full convert to json and
                    # put in buffer
                    if client_buffer != "":
                        logger.debug(f"{client_buffer}")
                        # we may be dealing with multiple messages,
                        # update buffer to produce a correct json string
                        client_buffer = "[" + client_buffer.replace("}{", "},{") + "]"
                        messages = json.loads(client_buffer)
                        logger.debug(f"Received socket message(s): {messages}")
                        self.message_buffer.extend(deque(messages))
                    # client disconnected
                    break

                else:
                    message = data.decode("utf-8")
                    client_buffer += message

            except Exception as e:
                logger.info(f"Error while receiving message:\n{e}\n")
                break

        conn.close()

    def _bind_server_socket(self, mp_start_event=None):
        """Bind the server socket to the configured host and port."""
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            self.server_socket.bind((self.host, self.port))
        except OSError as e:
            if e.errno in (48, 98, 10048):
                if self.server_socket:
                    self.server_socket.close()
                    self.server_socket = None

                if mp_start_event is not None:
                    logger.warning(
                        "Address already in use, socket "
                        f"reused on {self.host}:{self.port}"
                    )
                    mp_start_event.set()
                    return False

            logger.exception(f"Failed to bind socket: {e}")
            return False

        logger.info(f"Socket bound to {self.host}:{self.port}")
        return True

    def start_manager(self, mp_start_event=None, mp_shutdown_event=None):
        """Start the task manager.

        Parameters
        ----------
        mp_start_event : multiprocessing.Event
            Event to signal that the manager has started.
        mp_shutdown_event : multiprocessing.Event
            Event to signal that the manager should shut down.

        """
        logger.info(f"Starting task server on {self.host}:{self.port}")

        if not self._bind_server_socket(mp_start_event):
            return

        self.server_socket.listen()

        if mp_start_event is not None:
            mp_start_event.set()

        self.server_socket.settimeout(1.0)

        def _signal_handler(signum, frame):
            logger.info(f"Shutting down task manager due to signal {signum}")
            self.stop_manager(mp_shutdown_event)

        signal.signal(signal.SIGINT, _signal_handler)
        signal.signal(signal.SIGTERM, _signal_handler)

        while mp_shutdown_event is None or not mp_shutdown_event.is_set():
            try:
                # Accept incoming connections with a timeout
                conn, _ = self.server_socket.accept()
                # Start a new thread to handle the client connection
                client_thread = threading.Thread(
                    target=self._handle_incoming_messages, args=(conn,)
                )
                # client_thread.daemon = True
                client_thread.start()
                # Store the latest client thread and conn
                self.client_thread = client_thread
                self.client_conn = conn

            except socket.timeout:
                # No incoming connections => perform handling queue
                self._process_buffer()
                # Pop tasks from database into 'pending'
                self.pop_waiting_queue()
                # continue to check for shutdown conditions
                continue

            except OSError as e:
                if e.errno == errno.EBADF:
                    # Socket was closed, exit loop silently
                    break
                logger.error(f"Socket error occurred: {e}")
                break  # Exit the loop if the socket is closed

        # After exiting main loop, clean up client thread
        if self.client_thread and self.client_conn:
            try:
                self.client_conn.shutdown(socket.SHUT_RDWR)
            except Exception:
                pass
            try:
                self.client_conn.close()
            except Exception:
                pass
            self.client_thread.join(timeout=1.0)

    def stop_manager(self, mp_shutdown_event=None):
        """Gracefully stop the manager and close the socket."""

        # Signal to the main process that the manager is shutting down
        # and set the shutdown event if provided
        if mp_shutdown_event is not None and not mp_shutdown_event.is_set():
            logger.info("Shutting down task manager...")
            mp_shutdown_event.set()

        # Close the server socket
        if self.server_socket:
            try:
                self.server_socket.close()
            except OSError as e:
                logger.error(f"Failed to close server socket: {e}")
            finally:
                self.server_socket = None
        logger.info("Task manager has been stopped.")

        # Close the database session

        if self.session:
            try:
                self.session.close()
            except Exception as e:
                logger.error(f"Failed to close database session: {e}")
            self.session = None

        # After closing server socket and DB session, also clean up client thread
        if getattr(self, "client_thread", None) and getattr(self, "client_conn", None):
            try:
                self.client_conn.shutdown(socket.SHUT_RDWR)
            except Exception:
                pass
            try:
                self.client_conn.close()
            except Exception:
                pass
            self.client_thread.join(timeout=1.0)


def run_task_manager(
    max_workers=None,
    host=None,
    port=None,
    mp_start_event=None,
    mp_shutdown_event=None,
    verbose=0,
):
    kwargs = {}
    if max_workers is not None:
        kwargs["max_workers"] = max_workers
    if host is not None:
        kwargs["host"] = host
    if port is not None:
        kwargs["port"] = port

    _setup_logging(verbose=verbose)

    manager = TaskManager(**kwargs)
    manager.start_manager(mp_start_event, mp_shutdown_event)
