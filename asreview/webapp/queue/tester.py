import json
import socket
import threading
import time

PAYLOAD = {
    "action": "insert",
    "project_id": "5285RG42wL-5UZslwiWb-Y2xU3pyFwGrYjYRbbjO--g",
    "simulation": False
}

def send_payloads(client_id):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
        client_socket.connect(('127.0.0.1', 5555))

        payload = dict(PAYLOAD)

        for i in range(5):
            payload["project_id"] = f"{client_id}-{i}" + PAYLOAD["project_id"]
            print(f"Sending message: {client_id} {i}")
            client_socket.sendall(json.dumps(payload).encode())
            #time.sleep(0.05)  # Sleep between messages

        print("Closing the connection.")
        client_socket.close()




if __name__ == "__main__":
    for client_id in range(5):
          threading.Thread(target=send_payloads, args=(client_id,)).start()

