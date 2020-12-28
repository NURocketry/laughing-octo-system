import serial
import asyncio
import websockets

# Serial stuff
port = '/dev/cu.usbserial-1420'
baud = 115200
ser = serial.Serial(port, baud, timeout=1)

#h andle income serial data and send to client via websockets
async def serial_stream(websocket, path):
    while True:
        if ser.isOpen():
            # read serial content, strip trailing /r/n, decode bytes to string
            serial_content = ser.readline().strip().decode('utf-8') 
            print(serial_content) #logging/debugging
            await websocket.send(serial_content)
        else: 
            # if connection has closed for some reason, try and open it again indefinitely
            # ... objectively a bad idea but hacky solution to allow arduino resets during testing
            # potentially will need to be properly implemented in case connection with rocket is lost and regained mid flight
            ser.open()

start_server = websockets.serve(serial_stream, "localhost", 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()