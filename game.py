# from microbit import *

import serial
import threading
from queue import Queue
PORT = "/dev/tty.usbmodem1412"
BAUD = 115200
s = serial.Serial(PORT)
s.baudrate  = BAUD
s.parity    = serial.PARITY_NONE
s.databits  = serial.EIGHTBITS
s.stopbits  = serial.STOPBITS_ONE
q = Queue()
lock = threading.Lock()


def readAcc():
    global s, lock
    try:
        while True:
            # client send data each 50ms?
            data = list(map(int, s.readline().decode("utf-8").rstrip().split(" ")))
            # data = s.readline()
            lock.acquire()
            try:
                q.put(data, block=True)
            finally:
                lock.release()
    finally:
        s.close()


if __name__ == "__main__":
    thrd = threading.Thread(target=readAcc)
    thrd.start()
    while True:
        data = q.get()
        print(data)

