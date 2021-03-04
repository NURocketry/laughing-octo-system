import asyncio
import os
import sys
import threading
import time

import aiohttp_jinja2
import jinja2
import psutil
import pyqrcode
import serial
import serial.tools.list_ports
import websockets
from aiohttp import web

AZUREKEY1 = ""
AZUREKEY2 = ""

# Load in azure keys from the computer environment
try:
    AZUREKEY1 = os.environ['NU_ROCKET_AZUREKEY_1']
    AZUREKEY2 = os.environ['NU_ROCKET_AZUREKEY_2']
except:
    print("WARNING: Azure keys are not set so map feature will not be functional")
    print("Set NU_ROCKET_AZUREKEY_1 and NU_ROCKET_AZUREKEY_2 with appropriate azure keys")

# Get all possible network addresses
possible_network_addresses = set()
network_addresses_list = psutil.net_connections("tcp")

# Remove duplicates addresses
for address in network_addresses_list:
    possible_network_addresses.add(address.laddr.ip)

# Remove address that can't bind to
possible_network_addresses.remove("::")
possible_network_addresses.remove("0.0.0.0")

print("\nSelect from the list below which network to broadcast to")

address_counter = 0
for address in possible_network_addresses:
    print("Option: {}\n {}".format(address_counter, address))
    address_counter = address_counter + 1

print("\nWhat network would you like to use?")
network_option = int(input("Option: "))

network_address = list(possible_network_addresses)[network_option]

print("You have selected the network: " + network_address)
print("Go to http://" + network_address + ":8080")

if len(sys.argv) > 1:  # if the arguments given are > 1

    mode = 'r'  # read from file mode
    filepath = sys.argv[1]  # filepath of the file to be read

    print("Reading from local file @ %s" % filepath)

else:  # if no file path given; run as append mode

    mode = 'a'  # append mode so data is not overwritten in case of existing filename

    filepath = time.strftime("%Y-%m-%dT%H%M%SZ",
                             time.gmtime()) + " launch.csv"  # ISO8601 compliant time filename

    print("Logging flight data to local file: '%s'" % filepath)

    port_list = serial.tools.list_ports.comports()

    print("\nThe current ports connected to this computer are:")
    port_counter = 0
    for port, desc, hwid in port_list:
        print("Option: {}\n {}: {} [{}]".format(port_counter, port, desc, hwid))
        port_counter += 1

    print("\nWhat port would you like to use?")
    port_option = int(input("Option: "))
    print("Selected port: " + str(port_list.__getitem__(port_option)))

    selected_port = str(port_list.__getitem__(port_option).device)
     # set baud for micro-controller
    baud = 115200
    
# generate the QR code, so users are able to scan the address with their phone instead of typing it in
print("\nGenerating QR Code for the network address...")
qr_code = pyqrcode.create("http://" + network_address + ":8080")
qr_code.png('code.png', scale=6, module_color=[0, 0, 0, 128], background=[0xff, 0xff, 0xcc])
qr_code.show()

   

USERS = set()  # All active web socket connection

async_container = []


# Broadcast messages to all web socket connected
async def notify_state(state):
    # asyncio.wait is now deprecated when python 3.11 comes out
    # use the create task to execute new task DON NOT USE async.wait
    # Below have been future proof function to at least python 3.11
    if USERS:
        for user in USERS:
            task = asyncio.create_task(user.send(state))
            await task


async def terminate_async_loops():
    # function to terminate the async loops, the for loop iterates through the loop container
    # then calls the stop on each one, but the system still runs and requires the os._exit()
    # to stop entirely
    print("Attempting to terminate the program...")
    for async_thread in range(0, len(async_container)):
        async_container[async_thread].call_soon_threadsafe(async_container[async_thread].stop)

    # force quit
    os._exit(0)


def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller.
    Used to get the relative path of the file system.
    Used when compiling the application"""
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)


# Add new web socket user
async def register(websocket):
    print("A user has connected")
    USERS.add(websocket)


# Remove web socket user
async def unregister(websocket):
    print("A user has disconnected")
    USERS.remove(websocket)


# handles any new web socket connection
async def counter(websocket, path):
    await register(websocket)
    try:
        async for message in websocket:
            print(message)
    finally:
        await unregister(websocket)


# Handle income serial data and send to client(s) via websockets
async def serial_stream():
    serial_content = ""
    read_count = 0  # Used to limit the amount of data sent to web socket
    # prev_time = 0
    error_count = 0
    data_to_write = ""

    # waits for the user to press enter before opening the serial port
    input("Press enter to open the serial port")

    # open the serial connection
    ser = serial.Serial(selected_port, baud, timeout=1)

    while True:
        if ser.isOpen():
            try:
                # read serial content, strip trailing special characters, decode bytes to string
                serial_content = ser.readline().strip().decode('utf-8')
            except:
                # if the data transmitted has 10 or more errors consecutively, it exits the program
                # these inputs are not expected during normal executions, but are created sometimes during mock tests or
                # if the connection is lost and ensures that any data received is written to the file before termination
                print("Invalid input/encoding error; attempting to read next line. Attempt: " + str(error_count))
                error_count = error_count + 1
                if error_count == 11:
                    print("Error detected, writing final data and closing file connection")
                    file.write(data_to_write)
                    file.close()
                    await terminate_async_loops()
                    break

            # ensures that the data received does not equal null
            if serial_content != "":

                #  data validation, ensures that it contains a comma
                if serial_content.__contains__(","):

                    data_to_write = data_to_write + serial_content + "\n"

                    # code below calculates the time difference and sends data based on time difference, rather than
                    # a arbitrary value (such as 10) if perceived accuracy is required

                    # current_time = float(serial_content.split(",")[0])
                    # time_difference = current_time - prev_time

                    if read_count == 10:
                        print(serial_content)  # prints current serial content to console for logging/debugging

                        # writes content to the buffer
                        file.write(data_to_write)

                        # writes the buffer contents into the file, without closing the file
                        file.flush()

                        # resets the data_to_write for next 10 lines
                        data_to_write = ""

                        # sends data to web socket clients
                        await notify_state(serial_content)

                        # for some reason including the sleep makes it work on windows, if it causes and issues the
                        # sleep time can be decreased please note that it is in seconds, not milliseconds
                        # seems to work without this since implementing threading, but it is included "just to be safe"
                        await asyncio.sleep(0)

                        # for the time difference code as mentioned above
                        # prev_time = current_time
                        read_count = 0

                # if the micro-controller sends a stop command (not case sensitive)
                elif serial_content.lower() == "stop":
                    print("\nStop has been received from the device")
                    # writes final data
                    file.write(data_to_write)
                    # closes file
                    file.close()
                    await terminate_async_loops()
                    break
                # increase read_count for the loop
                read_count += 1


# handle file data and send to client via websockets
async def file_stream():
    read_count = 0  # counter for limiting the data sent
    previous_time = 0  # prev time for simulating sending times

    input("Press enter to start reading the file")

    for file_line in (line.strip() for line in file):  # iterate over each line with trailing newlines removed

        if len(file_line) < 2:
            continue  # dont send empty lines

        if read_count == 10:  # limits render time

            current_time = float(file_line.split(',')[0])  # extract time value from csv

            # determines the wait time for each transmission
            time_difference_to_wait = current_time - previous_time

            # set the previous time for next iteration
            previous_time = current_time

            # waits the program, to simulate event time
            await asyncio.sleep(time_difference_to_wait)

            # print to console for logging/debugging purposes
            print(file_line)

            # send data to web socket clients
            await notify_state(file_line)

            # reset read count
            read_count = 0

        read_count += 1

    print("\nFinished replaying launch data from '%s'" % filepath)
    file.close()
    await terminate_async_loops()


# Web server to publish web page contents this includes resources like css and js files
async def index(request):
    return web.FileResponse(resource_path('client/index.html'))


# universal thread creator, returns a thread that can be allocated to a task
def _start_async():
    async_loop = asyncio.new_event_loop()
    threading.Thread(target=async_loop.run_forever).start()

    async_container.append(async_loop)

    return async_loop


def handler(request):
    context = {'azKey1': AZUREKEY1, 'azkey2': AZUREKEY2, 'webserver': network_address}
    response = aiohttp_jinja2.render_template('client.js',
                                              request,
                                              context)
    return response


# sets up web server
app = web.Application()

# sets up the template engine for the injecting azure keys as variables into web requests
aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader(resource_path('client/js/')))

# add routes to web server
app.add_routes([web.get('/', index)])
app.add_routes([web.get('/js/client.js', handler)])
app.router.add_static('/', path=resource_path('client/'))

# requires windows-1252 encoding instead of UTF-8 because superscript 2's arent encoded as utf8 atm
# TODO ensure we're ready to make utf-8 encoding standard for all NuRocketry stuff (and pure ascii block preferred)

# 'with' is important as it ensures file is closed even on an exception
with open(filepath, mode, encoding='windows-1252') as file:

    stream_loop = _start_async()

    # read mode, reading from file given by command arguments at initialisation
    if mode == 'r':
        next(file)  # discard csv column labels by skipping first line
        asyncio.run_coroutine_threadsafe(file_stream(), stream_loop)

    # append mode, reading from serial and appends to a file
    elif mode == 'a':  # append mode ensures data is not overwritten in case of a file name mishap
        # add column labels
        file.write(
            "Time (s), Altitude (m), Velocity (m/s), Acceleration (m/s^2), Air temperature (oC), Air pressure (mbar)\n")

        asyncio.run_coroutine_threadsafe(serial_stream(), stream_loop)

    # configures web socket server
    start_server = websockets.serve(counter, network_address, 5678)

    # starts web socket server
    asyncio.get_event_loop().run_until_complete(start_server)

    # starts web server
    web_app_loop = _start_async()
    asyncio.run_coroutine_threadsafe(web.run_app(app, port=8080), web_app_loop)
