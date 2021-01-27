#!/usr/bin/env python

import asyncio
import websockets
import random


async def hello():
    uri = 'ws://localhost:5678/'
    counter = 0
    while True:
        counter += 1
        async with websockets.connect(uri) as websocket:
            await websocket.send("Hello world!" + str(counter))
            await websocket.recv()


asyncio.get_event_loop().run_until_complete(hello())
