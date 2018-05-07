from microbit import *
import radio

radio.on()
radio.config(length=64, 
             queue=10, 
             channel=29, 
             power=7,
             data_rate=radio.RATE_1MBIT) # initialze radio
uart.init(115200) # initialize serial port

while True:
    try:
        incoming = radio.receive() # on every received packet
        uart.write(incoming) # send by serial
    except:
        continue
