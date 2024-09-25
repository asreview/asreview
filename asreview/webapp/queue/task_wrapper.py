import json
import multiprocessing as mp
import zmq

from asreview.webapp.queue import ZMQ_CONTEXT


class RunModelProcess(mp.Process):
    def __init__(self, func, args=(), domain="localhost", port=5555):
        super().__init__()
        self.func = func
        self.args = args
        self.domain = domain
        self.port = port

    def run(self):
        socket = ZMQ_CONTEXT.socket(zmq.REQ)
        socket.connect(f"tcp://{self.domain}:{self.port}")

        payload = {"action": "remove", "project_id": self.args[0]}
        try:
            result = self.func(*self.args)
        except Exception as e:
            payload["action"] = "failure"
        finally:
            socket.send_string(json.dumps(payload))
            socket.recv_string()
