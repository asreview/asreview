import inspect
import json
import logging
import multiprocessing as mp
import socket
import threading
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
        self.port = int(port)

    def run(self):
        payload = {"action": "remove", "project_id": self.args[0]}
        try:
            self.func(*self.args)
        except Exception:
            payload["action"] = "failure"
        finally:
            family = socket.AF_INET
            socket_type = socket.SOCK_STREAM
            with socket.socket(family, socket_type) as client_socket:
                client_socket.connect((self.host, self.port))
                client_socket.sendall(json.dumps(payload).encode("utf-8"))


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

    @property
    def waiting(self):
        records = self.session.query(ProjectQueueModel).all()
        return [r.project_id for r in records]

    def insert_in_waiting(self, project_id, simulation):
        # remember that there is a unique constraint on project_id
        try:
            new_record = ProjectQueueModel(
                project_id=str(project_id), simulation=bool(simulation)
            )
            self.session.execute(text("BEGIN TRANSACTION"))
            self.session.add(new_record)
            self.session.commit()
            logging.info(f"Project {project_id} inserted to waiting list")
        except IntegrityError:
            logging.debug(f"Project {project_id} already exists in waiting list")
            self.session.rollback()
        except Exception:
            logging.error(f"Failed to add project {project_id} to waiting list")
            self.session.rollback()

    def is_waiting(self, project_id):
        record = (
            self.session.query(ProjectQueueModel)
            .filter_by(project_id=project_id)
            .first()
        )
        if record is None:
            return False
        else:
            return record

    def is_pending(self, project_id):
        return project_id in self.pending

    def remove_pending(self, project_id):
        if project_id in self.pending:
            self.pending.remove(project_id)
            logging.info(f"Removed project {project_id} from pending area")
        else:
            logging.error(f"Failed to find project {project_id} in pending area")

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
                logging.info(f"Save to move project {project_id} to pending area")
            except Exception:
                self.session.rollback()
                # remove from pending
                self.remove_pending(project_id)
                logging.error(f"Failed to move project {project_id} to pending area")

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
            logging.info(f"Run process for project: {project_id}")
            return True
        except Exception as _:
            message = f"Failed to spin up training process for project: {project_id}"
            logging.error(message)
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
                logging.error(f"Failed to select waiting project ids: {e}")
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
                    logging.error(f"Failed to train model for project {project_id}")
                self.remove_pending(project_id)

    def _handle_incoming_messages(self, conn):
        """Handles incoming traffic."""
        client_buffer = ""
        while True:
            try:
                data = conn.recv(self.receive_bytes)
                logging.info(f"{data}")
                if not data:
                    # if client_buffer is full convert to json and
                    # put in buffer
                    if client_buffer != "":
                        logging.info(f"{client_buffer}")
                        # we may be dealing with multiple messages,
                        # update buffer to produce a correct json string
                        client_buffer = "[" + client_buffer.replace("}{", "},{") + "]"
                        messages = json.loads(client_buffer)
                        logging.info(f"Received messages:\n{messages}\n")
                        self.message_buffer.extend(deque(messages))
                    # client disconnected
                    break

                else:
                    message = data.decode("utf-8")
                    client_buffer += message

            except Exception as e:
                logging.info(f"Error while receiving message:\n{e}\n")
                break

        conn.close()

    def start_manager(self, mp_event=None):
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.bind((self.host, self.port))
        server_socket.listen()

        # Acknowledge MultipProcessing we could connect
        if mp_event is not None:
            mp_event.set()

        # Set a timeout
        server_socket.settimeout(0.1)

        logging.info(f"...starting server on {self.host}:{self.port}")

        while True:
            try:
                # Accept incoming connections with a timeout
                conn, _addr = server_socket.accept()
                # Start a new thread to handle the client connection
                client_thread = threading.Thread(
                    target=self._handle_incoming_messages, args=(conn,)
                )
                client_thread.start()

            except socket.timeout:
                # No incoming connections => perform handling queue
                self._process_buffer()
                # Pop tasks from database into 'pending'
                self.pop_waiting_queue()


def setup_logging(verbose=False):
    level = logging.INFO if verbose else logging.ERROR
    logging.basicConfig(level=level, format="%(asctime)s - %(levelname)s - %(message)s")


def run_task_manager(
    max_workers=None, host=None, port=None, verbose=False, mp_event=None
):
    # I need all parameters that are not None to pass to the TaskManager object.
    signature = inspect.signature(run_task_manager)
    bound_arguments = signature.bind(max_workers, host, port)

    args = {k: v for k, v in bound_arguments.arguments.items() if v is not None}

    setup_logging(verbose)
    manager = TaskManager(**args)
    manager.start_manager(mp_event)
