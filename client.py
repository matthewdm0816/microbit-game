from microbit import *
import radio
display.scroll("INSERT COIN", wait=False, loop=True)

ID = 2
BAUD = 115200  # default BAUD rate
uart.init(BAUD)
TICK = 128
REFRESH = 1000 // TICK

radio.on()
radio.config(length=64,
             queue=10,
             channel=29,
             power=7,
             data_rate=radio.RATE_1MBIT)

def getDirection(x, y, z):
    """
    :return: direction: 0, 1, 2, 3, 4 --- UP, RIGHT, DOWN, LEFT, NONE
    """
    limit = 250
    if abs(x) > abs(y):
        if x > limit:
            return 1
        elif x <= -limit:
            return 3
        else:
            return 4
    else:
        if y > limit:
            return 2
        elif y <= -limit:
            return 0
        else:
            return 4

old_dir = 4
def getData():
    global old_dir
    x, y, z = \
        accelerometer.get_x(), accelerometer.get_y(), accelerometer.get_z()
    # a, b = button_a.was_pressed(), button_b.was_pressed()
    # data = str(ID) + " " + str(x) + " " + str(y) + " " + str(z) + "\n"
    dir = getDirection(x, y, z)
    data = str(ID) + " " + str(dir) + "\n"
    if dir != old_dir:
        radio.send(data)
        old_dir = dir
        uart.write(data)  # for DEBUG
    return dir

def displayArrow(dir):
    # TODO: implement direction indication
    pixels = {
        "upleft"   : [[2, 0], [1, 1], [0, 2]],
        "downleft" : [[2, 4], [1, 3], [0, 2]],
        "upright"  : [[2, 0], [3, 1], [4, 2]],
        "downright": [[2, 4], [3, 3], [4, 2]],
    }
    arrows = {
        0 : ["upleft", "upright"],
        1 : ["upright", "downright"],
        2 : ["downleft", "downright"],
        3 : ["upleft", "downleft"],
        4 : ["upleft", "downleft", "upright", "downright"]
    }
    display.clear()
    if dir == 4:
        return
    for direction in arrows[dir]:
        pixels_ = pixels[direction]
        for pixel in pixels_:
            # print(pixels_)
            x, y = pixel
            display.set_pixel(x, y, 9)


started = False
paused = False
while True:
    a, b = button_a.was_pressed(), button_b.was_pressed()
    if b is True:
        paused = True
    if a is True:
        started = True
        display.scroll("COIN INSERTED, GAME START", wait=False, delay=50)
    if started is True:
        dir = getData()
        displayArrow(dir)
    sleep(REFRESH)
