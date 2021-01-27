import serial
import asyncio
import websockets

# Serial stuff

# Port Selection
# port = '/dev/ttyACM0'
# portSelection = input('Use default port: /dev/ttyACM0? Y/n: ')
# if portSelection == 'n':
#     port = input('Port: ')

# baud = 115200
# ser = serial.Serial(port, baud, timeout=1)
executed = False
connected = set()
# Handle income serial data and send to client via websockets
async def serial_stream(websocket, path):

    connected.add(websocket)

    if executed == True:
        return 0

    print("Executing")
    while True:
        print(connected)
        for ws in connected:
            try:
                await asyncio.wait([ws.send("1,1,1,1,1")])
            except Exception as e:
                print("Remove Web socket")
                connected.remove(websocket)
                pass

        await asyncio.sleep(1)


start_server = websockets.serve(serial_stream, "localhost", 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()