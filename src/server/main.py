import os
import threading
import serial
import asyncio
import websockets
import sys  # commandline arguments
import time  # for logging
from aiohttp import web  # Web server

if len(sys.argv) > 1:  # filepath given, read

    mode = 'r'  # read
    filepath = sys.argv[1]  # filepath taken from commandline

    print("Reading from local file @ %s" % filepath)

else:  # no filepath given, write

    mode = 'a'  # append mode so data is not overwritten in case of existing filename

    filepath = "../data/" + time.strftime("%Y-%m-%dT%H%M%SZ",
                                          time.gmtime()) + " launch.csv"  # ISO8601 compliant time filename

    print("Logging flight data to local file: '%s'" % filepath)

    # init required serial stuff
    # Port Selection
    port = input('port: ') if input('use default port: COM3? Y/n: ') == 'n' else 'COM3'

    baud = 115200
    ser = serial.Serial(port, baud, timeout=1)  # establish serial connection

USERS = set()  # All active web socket connection

async_container = []
thread_container = []


# Broadcast messages to all web socket connected
async def notify_state(STATE):
    # asyncio.wait is now deprecated when python 3.11 comes out
    # use the create task to execute new task DON NOT USE async.wait
    # Below have been future proof function to at least python 3.11
    if USERS:
        for user in USERS:
            task = asyncio.create_task(user.send(STATE))
            await task


async def terminate_async_loops():
    print("test")
    print(async_container)
    for x in range(0, len(async_container)):
        async_container[x].call_soon_threadsafe(async_container[x].stop)

    # shutdown_asyncgens
    os._exit(0)


# Add new web socket user
async def register(websocket):
    print("REGISTER")
    USERS.add(websocket)


# Remove web socket user
async def unregister(websocket):
    USERS.remove(websocket)


# if a commandline argument is passed at all, it is assumed to be a filepath and the program enters read-from-file
# mode if no commandline arguments are given the program enters write mode for logging and attempts to connect to the
# serial port


async def counter(websocket, path):
    await register(websocket)
    try:
        async for message in websocket:
            print(message)
    finally:
        await unregister(websocket)


# Handle income serial data and send to client via websockets
async def serial_stream():
    serial_content = ""
    read_count = 0  # Used to limit the amount of data sent to site
    prev_time = 0
    error_count = 0
    data_to_write = ""
    while True:
        if ser.isOpen():

            try:
                # read serial content, strip trailing /r/n, decode bytes to string
                serial_content = ser.readline().strip().decode('utf-8')
            except:
                # if the data transmitted has 10 or more errors in a row with the data, it exits the loop
                print("Invalid input/encoding error; attempting to read next line. Attempt: " + str(error_count))
                error_count = error_count + 1
                if error_count == 11:
                    print("Error detected, writing final data and closing file connection")
                    f.write(data_to_write)
                    f.close()
                    await terminate_async_loops()
                    break

            if serial_content != "":  # make sure we don't send a blank message (happens) and

                if serial_content.__contains__(","):
                    # f.writelines(serial_content) # log to file with trailing newline(!) (no rate limiting for logs)
                    # assuming the content is utf-8, not null, and contains a "," it is valid data and written to the
                    # csv

                    data_to_write = data_to_write + serial_content + "\n"

                    # code for using time difference to transmit data to the webpage, has issues of sending "too much
                    # data" and eventually skewing the graphs since the initial data can't be rendered current_time =
                    # float(serial_content.split(",")[0]) time_difference = current_time - prev_time

                    # if time_difference > 1:
                    if read_count == 10:
                        print(serial_content)  # logging/debugging

                        f.write(data_to_write)

                        f.flush()

                        data_to_write = ""

                        await notify_state(serial_content)

                        # for some reason including the sleep makes it work on windows, if it causes and issues the
                        # sleep time can be decreased please note that it is in seconds, not millisecond
                        await asyncio.sleep(0)

                        # for using time difference instead of count as mentioned above
                        # prev_time = current_time
                        read_count = 0
                read_count = read_count + 1
        else:
            # if connection has closed for some reason, try and open it again indefinitely ... objectively a bad idea
            # but hacky solution to allow arduino resets during testing potentially will need to be properly
            # implemented in case connection with rocket is lost and regained mid flight
            ser.open()


# handle file data and send to client via websockets
async def file_stream():
    read_count = 0  # rate limit sent data
    previous_time = 0

    # reference_time = time.time()  # seconds since epoch for accurate playback

    for file_line in (l.strip() for l in f):  # iterate over each line with trailing newlines removed

        if len(file_line) < 2:
            continue  # dont send empty lines

        if read_count == 10:  # limits render time

            # logging/debugging

            # the only reason these variables are explicitly split up and defined is for debugging/logging
            # doubt it's importance (performance-wise) to combine the statements and I figure it's done under
            # the hood during interpretation anyway

            current_time = float(file_line.split(',')[0])  # extract time value from csv line

            time_difference_to_wait = current_time - previous_time

            # set the previous time for next loop
            previous_time = current_time

            # debugging
            # print("-> %0.3f (%0.3f = %0.3f - %0.3f)" % (offset, delta, current_time, reference_time) ) 

            # time_difference_to_wait
            await asyncio.sleep(time_difference_to_wait)

            print(file_line)
            await notify_state(file_line)

            read_count = 0

        read_count += 1  # increment rate limiter

    print("\nFinished replaying launch data from '%s'" % filepath)
    f.close()
    await terminate_async_loops()


# Web server to publish html and other client side resources
# Web server to publish web page contents this includes resources like css and js files
async def index(request):
    return web.FileResponse('../client/liveData.html')


def _start_async():
    async_loop = asyncio.new_event_loop()
    new_thread = threading.Thread(target=async_loop.run_forever).start()

    async_container.append(async_loop)
    thread_container.append(new_thread)

    return async_loop


app = web.Application()
app.add_routes([web.get('/', index)])
app.router.add_static('/', path='../client/')

# requires windows-1252 encoding instead of UTF-8 because superscript 2's arent ecoded as utf8 atm
# TODO ensure we're ready to make utf-8 encoding standard for all NuRocketry stuff (and pure ascii block preffered)
# global f
with open(filepath, mode,
          encoding='windows-1252') as f:  # 'with' is important as it ensures file is closed even on an exception
    # READ i.e. replaying from file

    stream_loop = _start_async()

    if mode == 'r':
        next(f)  # discard csv column labels by skipping first line
        # TODO server handling to be updated to work with Josh's improvements (including both windows and multiple
        #  connections)

        asyncio.run_coroutine_threadsafe(file_stream(), stream_loop)

    # WRITE i.e. logging data from serial
    elif mode == 'a':  # append mode ensures data is not overwritten in case of a file name mishap
        # add column labels
        f.write(
            "Time (s), Altitude (m), Velocity (m/s), Acceleration (m/s^2), Air temperature (oC), Air pressure (mbar)\n")
        # TODO server handling to be updated to work with Josh's improvements (including both windows and multiple
        #  connections)

        asyncio.run_coroutine_threadsafe(serial_stream(), stream_loop)

    # TODO server handling to be updated to work with Josh's improvements (including both windows and multiple
    #  connections)

    # web socket stuff
    start_server = websockets.serve(counter, "localhost", 5678)

    asyncio.get_event_loop().run_until_complete(start_server)

    # web server stuff
    web_app_loop = _start_async()
    asyncio.run_coroutine_threadsafe(web.run_app(app, port=8080), web_app_loop)
