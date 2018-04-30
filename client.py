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


def get_data():
    x, y, z = \
        accelerometer.get_x(), accelerometer.get_y(), accelerometer.get_z()
    # a, b = button_a.was_pressed(), button_b.was_pressed()
    data = str(ID) + " " + str(x) + " " + str(y) + " " + str(z) + "\n"
    radio.send(data)
    uart.write(data)  # for DEBUG


started = False
paused = False
while True:
    a, b = button_a.was_pressed(), button_b.was_pressed()
    if b is True:
        paused = True
    if a is True:
        started = True
        display.scroll("COIN INSERTED, GAME START", wait=False)
    if started is True:
        get_data()
        # TODO: implement direction indication
    sleep(REFRESH)
