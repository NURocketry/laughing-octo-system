import serial
import asyncio
import websockets
import sys # commandline arguments
import time # for logging


if len(sys.argv) > 1: # filepath given, read

    mode = 'r' # read
    filepath = sys.argv[1]

    print("Reading from local file @ %s" % filepath)

else: # no filepath given, write

    mode = 'w'
    filepath = "../data/" + time.strftime("%Y-%m-%dT%H%M%SZ", time.gmtime()) + " launch.csv" # ISO8601 compliant time filename

    print("Logging flight data to local file: '%s'" % filepath)

    # init required serial stuff
    #Port Selection
    port = input('port: ') if input('use default port: /dev/ttyACM0? Y/n: ') == 'n' else '/dev/ttyACM0';

    baud = 115200
    ser = serial.Serial(port, baud, timeout=1)


#Handle income serial data and send to client via websockets
async def serial_stream(websocket, path):
    read_count = 0 #Used to limit the amount of data sent to site
    while True:
        if ser.isOpen():

            # read serial content, strip trailing /r/n, decode bytes to string
            serial_content = ser.readline().strip().decode('utf-8')  

            if len(serial_content): # make sure we don't send a blank message (happens) and 

                f.write(serial_content + "\n") # log to file

                if read_count % 10  == 0: # limits render time
                    print(serial_content) #logging/debugging
                    await websocket.send(serial_content)

            read_count += 1

        else: 
            # if connection has closed for some reason, try and open it again indefinitely
            # ... objectively a bad idea but hacky solution to allow arduino resets during testing
            # potentially will need to be properly implemented in case connection with rocket is lost and regained mid flight
            ser.open()

#handle file data and send to client via websockets
async def file_stream(websocket, path):
    read_count = 0 # rate limit sent data
    reference_time = time.time() # seconds since epoch for accurate playback

    for line in f:
        
        csv_content = f.readline().strip() # read line discarding the newline character
        
        if len(csv_content) < 2 : continue # dont send empty lines

        timestamp = float(csv_content.split(',')[0]) # exract time value from csv line

        offset = timestamp - (time.time() - reference_time) # delta between the python program's time and the live time
        
        if offset > 0: #if the loop is running faster than incoming data, wait to catch up
            time.sleep(offset/100)
        '''
        TODO: fix timing issues, probably something to do with offset not accounting for execution time, or differences
        in reacount rate limiting for serial streaming/reading from file.
        '''
        if read_count % 10  == 0: # limits render time
            print(csv_content) #logging/debugging
            await websocket.send(csv_content)
        
        read_count += 1 
    
    print("Finished replaying launch data from '%s'" % filepath)

        
# requires windows-1252 encoding instead of UTF-8 because superscript 2's arent ecoded as utf8 atm
with open(filepath, mode, encoding = 'windows-1252' ) as f: #ensures f.close() is called at the end
    if mode == 'r':
        f.readline() # discard csv column labels
        start_server = websockets.serve(file_stream, "localhost", 5678)
    elif mode == 'w':
        f.write("Time (s), Altitude (m), Velocity (m/s), Acceleration (m/s^2), Air temperature (°C), Air pressure (mbar)\n") # add column labels
        start_server = websockets.serve(serial_stream, "localhost", 5678)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

