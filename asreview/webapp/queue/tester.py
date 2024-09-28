import json
import zmq
import time
import pandas as pd

from asreview.webapp.queue import ZMQ_CONTEXT

if __name__ == "__main__":
    socket = ZMQ_CONTEXT.socket(zmq.PUSH)  # REQ socket sends requests
    socket.connect("tcp://localhost:5555")

    deltas = []

    for i in range(1):
        project_id = "d43fcb64847b4b32a99618d63f2b977f"
        print(f"{i}: {project_id}")
        t1 = time.time()
        payload = {"action": "insert", "project_id": project_id, "simulation": False}
        # Send a request to the background process
        socket.send(json.dumps(payload).encode("utf-8"))
        t2 = time.time()

        deltas.append(t2 - t1)

    series = pd.Series(deltas)
    print(f"average: {series.mean()}, std: {series.std()}")
