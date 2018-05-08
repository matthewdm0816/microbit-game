import serial
import threading
from queue import Queue
import math, json, time, os, sys
PORT = "/dev/tty.usbmodem1422" # serial identifier
BAUD = 115200 # default serial rate
s = serial.Serial(PORT) # initialize serial port
s.baudrate  = BAUD
s.parity    = serial.PARITY_NONE
s.databits  = serial.EIGHTBITS
s.stopbits  = serial.STOPBITS_ONE
q = Queue() 
lock = threading.Lock()

def readAcc(): 

    # reads data incoming of direction data
    global s, lock
    try:
        while True:
            # get data from serial port
            try:
                data = list(map(int, s.readline().decode("utf-8").rstrip().split(" ")))
            except:
                continue
            # put data into a Queue
            lock.acquire()
            try:
                q.put(data, block=True)
            finally:
                lock.release()
    finally:
        s.close()


def getDirection(x, y, z):
    """
    DEPRECATED - NOT USED IN SCRIPT
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
    """
    show direction string!
    FOR DEBUG, NOT USED IN ACTUAL CODE.
    """
    dirs = {
        0 : "Up",
        1 : "Right",
        2 : "Down",
        3 : "Left",
        4 : "None"
    }
    return dirs[n]

pathString = "MBGame/paperio/stats.json" # recorder file
if __name__ == "__main__":

    # create thread reading directions
    thrd = threading.Thread(target=readAcc)
    thrd.start()
    action = {}
    actionId = 0
    with open(pathString, "w") as f:
        # clear stats.json for each run
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

        # if not existed, create the json file
        if os.path.exists(pathString) is False:
            with open(pathString, 'x') as f:
                pass

        # write direction in file
        with open(pathString, "a") as f:
            f.write(json.dumps(action) + "$")
        print(actionId, id, showDir(dirNum))
