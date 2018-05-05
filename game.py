import serial
import threading
from queue import Queue
import math, json, time, os, sys
PORT = "/dev/tty.usbmodem1422"
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
    :return: direction: 0, 1, 2, 3, 4 --- UP, RIGHT, DOWN, LEFT, NONE
    """
    if abs(x) > abs(y):
        if x > 280:
            return 1
        elif x < -280:
            return 3
        else:
            return 4
    else:
        if y > 280:
            return 2
        elif y < -280:
            return 0
        else:
            return 4


def showDir(n):
    dirs = {
        0 : "Up",
        1 : "Right",
        2 : "Down",
        3 : "Left",
        4 : "None"
    }
    return dirs[n]

pathString = "game/MBGame/paperio/stats.json"
if __name__ == "__main__":
    thrd = threading.Thread(target=readAcc)
    thrd.start()
    action = {}
    actionId = 0
    with open(pathString, "w") as f:
        # clear stats.json
        pass

    while True:
        id, dirNum = q.get()
        actionId += 1
        action = {
            "actionId" : actionId,
            "action" : {
                "id" : id,
                "direction" : dirNum,
            }
        }

        if os.path.exists(pathString) is False:
            with open(pathString, 'x') as f:
                pass

        with open(pathString, "a") as f:
            f.write(json.dumps(action) + "$")
        print(actionId, id, showDir(dirNum))
