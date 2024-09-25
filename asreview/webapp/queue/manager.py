import json
import zmq
import time
import multiprocessing as mp

from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from asreview.webapp.queue.models import Base
from asreview.webapp.queue.models import ProjectQueueModel

from asreview.webapp import asreview_path
from asreview.webapp.queue import ZMQ_CONTEXT
from asreview.webapp.queue.task_wrapper import RunModelProcess

def long_running_task(x):
    print(f"\nstart training model for project: {x}\n")
    time.sleep(10)
    return x * x


class TaskManager:

    def __init__(self, max_workers=1, domain="localhost", port=5555):
        self.pending = set()
        self.max_workers = max_workers
        self.domain = domain
        self.port = port

        # set up socket
        self.socket = ZMQ_CONTEXT.socket(zmq.REP)
        self.socket.bind(f"tcp://{domain}:{self.port}")

        # set up message poller to avoid blocking when listening
        self.poller = zmq.Poller()
        self.poller.register(self.socket, zmq.POLLIN)

        # set up database
        database_url = f"sqlite:///{asreview_path()}/queue.sqlite"
        engine = create_engine(database_url)
        Base.metadata.create_all(engine)

        Session = sessionmaker(bind=engine)
        self.session = Session()


    @property
    def waiting(self):
        records = self.session.query(ProjectQueueModel).all()
        return [r.project_id for r in records]


    def insert_in_waiting(self, project_id):
        # remember that there is a unique constraint on project_id
        try:
            new_record = ProjectQueueModel(project_id=str(project_id))
            self.session.add(new_record)
            self.session.commit()
        except IntegrityError as e:
            self.session.rollback()


    def is_waiting(self, project_id):
        record = self.session \
            .query(ProjectQueueModel) \
            .filter_by(project_id=project_id) \
            .first()
        if record is None:
            return False
        else:
            return record


    def is_pending(self, project_id):
        return project_id in self.pending


    def remove_pending(self, project_id):
        if project_id in self.pending:
            self.pending.remove(project_id)
    

    def move_from_waiting_to_pending(self, project_id):
        record = self.is_waiting(project_id)
        if record:
            try:
                # add to pending
                self.add_pending(project_id)
                # delete
                self.session.delete(record)
                self.session.commit()
            except Exception as e:
                self.session.rollback()
                # remove from pending
                self.remove_pending(project_id)


    def add_pending(self, project_id):
        if not project_id in self.pending:
            self.pending.add(project_id)


    def __execute_job(self, project_id):
        try:
            p = RunModelProcess(
                func=long_running_task,
                args=(project_id,),
                domain=self.domain,
                port=self.port
            )
            p.start()
            return True
        except Exception as _:
            return False


    def pop_queue(self):
        # how many slots do I have?
        available_slots = self.max_workers - len(self.pending)

        if available_slots > 0:
            # select first n records
            records = self.session \
                .query(ProjectQueueModel) \
                .order_by(ProjectQueueModel.id) \
                .limit(available_slots) \
                .all()
            # loop over records
            for record in records:
                project_id = record.project_id
                # execute job
                if self.__execute_job(project_id):
                    # move out of waiting and put into pending
                    self.move_from_waiting_to_pending(project_id)


    def run_manager(self):
        while True:
            # poll for 500 ms (the alternative is working with an exception to
            # make receiving messages non-blocking)
            socks = dict(self.poller.poll(timeout=500))

            if self.socket in socks and socks[self.socket] == zmq.POLLIN:
                message = self.socket.recv_string()
                print(f"\nReceived message: {message}\n")

                # break up message in message and id
                request = json.loads(message)
                action = request.get("action", False)
                project_id = request.get("project_id", False)

                # =========================
                # execute requested actions
                # =========================
                if action == "insert" and project_id:
                    # This will insert into the waiting database if
                    # the project isn't there, it will fail gracefully
                    # if the project is already waiting
                    self.insert_in_waiting(project_id)
                    message = "inserted"
                
                elif action in ["remove", "failure"] and project_id:
                    self.remove_pending(project_id)
                    message = "removed"

                else:
                    message = "ok"

                self.socket.send_string(message)


            print(f"pending projects: {self.pending}    waiting: {self.waiting}",)
            time.sleep(2)
            self.pop_queue()


if __name__ == "__main__":
    manager = TaskManager(max_workers=2)
    manager.run_manager()
