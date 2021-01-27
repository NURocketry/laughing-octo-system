import serial
import asyncio
import websockets
import random
from aiohttp import web


# Serial stuff

# Port Selection
# port = '/dev/ttyACM0'
# portSelection = input('Use default port: /dev/ttyACM0? Y/n: ')
# if portSelection == 'n':
#     port = input('Port: ')

# baud = 115200
# ser = serial.Serial(port, baud, timeout=1)

USERS = set()

async def notify_state(message):
    if USERS:  # asyncio.wait doesn't accept an empty list
        await asyncio.wait([user.send(message) for user in USERS])


async def register(websocket):
    USERS.add(websocket)


async def unregister(websocket):
    USERS.remove(websocket)
    
async def counter(websocket, path):
    await register(websocket)
    try:
        # await websocket.send("HELLO")
        async for message in websocket:
            print(message)
    finally:
        await unregister(websocket)

# Handle income serial data and send to client via websockets
async def serial_stream():
    while True:
        a = str(random.randint(1, 1000))
        b = str(random.randint(1, 1000))
        c = str(random.randint(1, 1000))
        d = str(random.randint(1, 1000))
        e = str(random.randint(1, 1000))

        stateString = a + "," + b + "," + c + "," + d + "," + e
         
        await notify_state(stateString)
        await asyncio.sleep(0.5)

start_server = websockets.serve(counter, "localhost", 5678)

async def index(request):
    return web.FileResponse('../client/index.html')

app = web.Application()
app.add_routes([web.get('/', index)])
app.router.add_static('/', path='../client/')

#https://www.oreilly.com/library/view/daniel-arbuckles-mastering/9781787283695/9633e64b-af31-4adb-b008-972f492701d8.xhtml
asyncio.ensure_future(start_server)
asyncio.ensure_future(serial_stream())
asyncio.ensure_future(web.run_app(app,port=8080))


loop = asyncio.get_event_loop()
loop.run_forever()
loop.close()