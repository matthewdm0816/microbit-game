from microbit import *
import radio

radio.on()
radio.config(length=32, 
             queue=10, 
             channel=29, 
             power=7,
             data_rate=radio.RATE_1MBIT)
uart.init(115200)             

while True:
    incoming = radio.receive()
    uart.write(incoming)




