from aiohttp import web
import socketio
import threading
import logging
import asyncio

## creates a new Async Socket IO Server
sio = socketio.AsyncServer()
## Creates a new Aiohttp Web Application
app = web.Application()
# Binds our Socket.IO server to our Web App
## instance
sio.attach(app)

## we can define aiohttp endpoints just as we normally
## would with no change
async def index(request):
    with open('../client/liveData.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

## If we wanted to create a new websocket endpoint,
## use this decorator, passing in the name of the
## event we wish to listen out for
@sio.on('message')
async def print_message(sid, message):
    ## When we receive a new event of type
    ## 'message' through a socket.io connection
    ## we print the socket ID and the message
    print("Socket ID: " , sid)
    print(message)
    await sio.emit('message', message)


## We bind our aiohttp endpoint to our app
## router
app.router.add_get('/', index)

## We kick off our server

async def broadcast():
    while True:
        print("broadcast")
        await sio.broadcast.emit('message', "hello")
        await asyncio.sleep(1)


# x = threading.Thread(target=broadcast)
# logging.info("Main    : before running thread")
# x.start()

if __name__ == '__main__':
    web.run_app(app)

async def multiple_tasks():
    input_coroutines = [broadcast()]
    res = await asyncio.gather(*input_coroutines, return_exceptions=True)
    
    return res


asyncio.get_event_loop().run_until_complete(multiple_tasks())
asyncio.get_event_loop().run_forever()



