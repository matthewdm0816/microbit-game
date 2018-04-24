# from microbit import *

import serial
import threading
from queue import Queue
import math
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


def getDirection(x, y, z):
    """

    :param x: x axis acceleration value
    :param y: y axis acceleration value
    :param z: z axis acceleration value
    :return: direction: 0, 1, 2, 3 --- UP, RIGHT, DOWN, LEFT
    """
    if abs(x) > abs(y):
        if x > 100:
            return 0
        else:
            return 2
    else:
        if y > 100:
            return 1
        else:
            return 3


if __name__ == "__main__":
    thrd = threading.Thread(target=readAcc)
    thrd.start()
    while True:
        id, x, y, z = q.get()
        print(id, x, y, z)



