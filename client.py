from microbit import *
display.scroll("INSERT COIN")

BAUD = 115200  # default BAUD rate
uart.init(BAUD)
REFERSH = 200


def get_data():
    x, y, z = \
        accelerometer.get_x(), accelerometer.get_y(), accelerometer.get_z()
    # a, b = button_a.was_pressed(), button_b.was_pressed()
    uart.write(str(x) + " " + str(y) + " " + str(z) + "\n")


while True:
    a, b = button_a.was_pressed(), button_b.was_pressed
    if a is True:
        pass
    # display.scroll("COIN INSERTED, GAME START")
    get_data()
    sleep(REFRESH)
