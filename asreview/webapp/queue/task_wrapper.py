import json
import multiprocessing as mp
import socket

class RunModelProcess(mp.Process):
    def __init__(self, func, args=(), host="localhost", port=5555):
        super().__init__()
        self.func = func
        self.args = args
        self.host = host
        self.port = port

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
