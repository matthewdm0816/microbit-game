from microbit import *
import radio

radio.on()
radio.config(length=64, 
             queue=10, 
             channel=29, 
             power=7,
             data_rate=radio.RATE_1MBIT)
uart.init(115200)             

while True:
    try:
        incoming = radio.receive()
        uart.write(incoming)
    except:
        continue
