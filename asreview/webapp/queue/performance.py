import json
import zmq
import random
import time
import pandas as pd

from asreview.webapp.queue import ZMQ_CONTEXT

if __name__ == "__main__":
    socket = ZMQ_CONTEXT.socket(zmq.PUSH)  # REQ socket sends requests
    socket.connect("tcp://localhost:5555")

    deltas = []

    for i in range(200):
        project_id = random.randint(1, 40)
        print(f"{i}: {project_id}")
        t1 = time.time()
        # Send a request to the background process
        socket.send(
            json.dumps({"action": "insert", "project_id": project_id}).encode("utf-8")
        )
        t2 = time.time()

        deltas.append(t2 - t1)

    series = pd.Series(deltas)
    print(f"average: {series.mean()}, std: {series.std()}")


# with 2 secs tick
# Poller: average: 2.647001668214798, std: 1.4939340268091752
# Exception: average: 2.5638748526573183, std: 1.416522791868476

# without 2 secs tick
