import serial
import asyncio
import random
import websockets

# Serial stuff
port = '/dev/cu.usbserial-1420'
baud = 115200
ser = serial.Serial(port, baud, timeout=1)

async def time(websocket, path):
    while True:
        serial_content = ser.readline().strip().decode('utf-8') #strip trailing /r/n and decode bytes to string
        await websocket.send(serial_content)

start_server = websockets.serve(time, "localhost", 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()