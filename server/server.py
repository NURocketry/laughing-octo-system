import serial
import asyncio
import websockets

# Serial stuff
port = '/dev/cu.usbserial-1420'
baud = 115200
ser = serial.Serial(port, baud, timeout=1)

#handle income serial data and send to client via websockets
async def serial_stream(websocket, path):
    while True:
        #read serial content, strip trailing /r/n, decode bytes to string
        serial_content = ser.readline().strip().decode('utf-8') 
        await websocket.send(serial_content)

start_server = websockets.serve(serial_stream, "localhost", 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()