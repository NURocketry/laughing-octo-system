import serial
import asyncio
import websockets
import sys # commandline arguments
import time # for logging

# if a commandline argument is passed at all, it is assumed to be a filepath and the program enters read-from-file mode
# if no commandline arguments are given the program enters write mode for logging and attempts to connect to the serial port
if len(sys.argv) > 1: # filepath given, read

    mode = 'r' # read
    filepath = sys.argv[1] # filepath taken from commandline

    print("Reading from local file @ %s" % filepath)

else: # no filepath given, write

    mode = 'a' # append mode so data is not overwritten in case of existing filename 

    filepath = "../data/" + time.strftime("%Y-%m-%dT%H%M%SZ", time.gmtime()) + " launch.csv" # ISO8601 compliant time filename

    print("Logging flight data to local file: '%s'" % filepath)

    # init required serial stuff
    #Port Selection
    port = input('port: ') if input('use default port: COM3? Y/n: ') == 'n' else 'COM3'

    baud = 115200
    ser = serial.Serial(port, baud, timeout=1) # establish serial connection


#Handle income serial data and send to client via websockets
async def serial_stream(websocket, path):
    read_count = 0 #Used to limit the amount of data sent to site
    while True:
        if ser.isOpen():

            # read serial content, strip trailing /r/n, decode bytes to string
            serial_content = ser.readline().strip().decode('utf-8')  

            if len(serial_content): # make sure we don't send a blank message (happens) and 

                f.writelines(serial_content) # log to file with trailing newline(!) (no rate limiting for logs)

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

    for line in (l.strip() for l in f): # iterate over each line with trailing newlines removed
        
        if len(line) < 2 : continue # dont send empty lines
        # dont merge these two if statements because itll fuckup the $read_count rate limiting

        if (read_count % 10) == 0: # limits render time

            print(line) #logging/debugging

            # the only reason these variables are explicitly split up and defined is for debugging/logging
            # doubt it's importance (performance-wise) to combine the statements and I figure it's done under
            # the hood during interpretation anyway

            timestamp = float( line.split(',')[0] ) # exract time value from csv line

            current_time = time.time() # take a wild fucking guess what this is xox

            delta = current_time - reference_time # difference between the python program's time and the live time
            offset = timestamp - delta # amount by which the program is ahead of schedule
            
            # debugging
            # print("-> %0.3f (%0.3f = %0.3f - %0.3f)" % (offset, delta, current_time, reference_time) ) 

            if offset > 0: # if the loop is running faster than incoming data, wait to catch up
                time.sleep(offset) # sleep in seconds
            
            # second data from file
            await websocket.send(line)
        
        read_count += 1 # increment rate limiter
    
    print("\nFinished replaying launch data from '%s'" % filepath)

        
# requires windows-1252 encoding instead of UTF-8 because superscript 2's arent ecoded as utf8 atm
# TODO ensure we're ready to make utf-8 encoding standard for all NuRocketry stuff (and pure ascii block preffered)
with open(filepath, mode, encoding = 'windows-1252' ) as f: # 'with' is important as it ensures file is closed even on an exception
    # READ i.e. replaying from file
    if mode == 'r':
        next(f) # discard csv column labels by skipping first line
        # TODO server handling to be updated to work with Josh's improvements (including both windows and multiple connections)
        start_server = websockets.serve(file_stream, "localhost", 5678)

    # WRITE i.e. logging data from serial
    elif mode == 'a': # append mode ensures data is not overwritten in case of a file name mishap
        # add column labels
        f.write("Time (s), Altitude (m), Velocity (m/s), Acceleration (m/s^2), Air temperature (oC), Air pressure (mbar)\n")
        # TODO server handling to be updated to work with Josh's improvements (including both windows and multiple connections)
        start_server = websockets.serve(serial_stream, "localhost", 5678)

    # TODO server handling to be updated to work with Josh's improvements (including both windows and multiple connections)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

