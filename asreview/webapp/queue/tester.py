import zmq
import json
import time

def check_status():
    """Client endpoint that communicates with the background process."""
    context = zmq.Context()
    socket = context.socket(zmq.REQ)  # REQ socket sends requests
    socket.connect("tcp://localhost:5555")



    # Send a request to the background process
    socket.send_string(json.dumps({"action": "insert", "project_id": 4}))
    message = socket.recv_string()  # Receive the reply
    print(message)

    time.sleep(1)

    socket.send_string(json.dumps({"action": "insert", "project_id": 5}))
    message = socket.recv_string()  # Receive the reply
    print(message)

    # no sleep

    socket.send_string(json.dumps({"action": "insert", "project_id": 3}))
    message = socket.recv_string()  # Receive the reply
    print(message)

    time.sleep(1)

    # Send a request to the background process
    socket.send_string(json.dumps({"action": "insert", "project_id": 4}))
    message = socket.recv_string()  # Receive the reply
    print(message)

    time.sleep(1)

    socket.send_string(json.dumps({"action": "insert", "project_id": 5}))
    message = socket.recv_string()  # Receive the reply
    print(message)


if __name__ == '__main__':
    check_status()