import serial
import asyncio
import websockets

# Serial stuff

# Port Selection
port = '/dev/ttyACM0'
portSelection = input('Use default port: /dev/ttyACM0? Y/n: ')
if portSelection == 'n':
    port = input('Port: ')

baud = 115200
ser = serial.Serial(port, baud, timeout=1)


# Handle income serial data and send to client via websockets
async def serial_stream(websocket, path):
    readCount = 0  # Used to limit the amount of data sent to site
    while True:
        if ser.isOpen():

            # read serial content, strip trailing /r/n, decode bytes to string
            serial_content = ser.readline().strip().decode('utf-8')

            if len(serial_content) and readCount == 9:  # make sure we don't send a blank message (happens) and limits render time
                print(serial_content)  # logging/debugging

                await websocket.send(serial_content)

                # for some reason including the sleep makes it work on windows, if it causes and issues the sleep
                # time can be decreased
                # please note that it is in seconds, not millisecond
                await asyncio.sleep(0)

                readCount = 0
            readCount += 1
        else:
            # if connection has closed for some reason, try and open it again indefinitely
            # ... objectively a bad idea but hacky solution to allow arduino resets during testing
            # potentially will need to be properly implemented in case connection with rocket is lost and regained mid flight
            ser.open()


start_server = websockets.serve(serial_stream, "localhost", 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
