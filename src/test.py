import serial
ser = serial.Serial('/dev/ttyACM0')
ser.flushInput()

while True:
    try:
        rawSerial = ser.readline()
        decodedSerial= str(rawSerial[0:len(rawSerial)-2].decode("utf-8"))
        yolo = decodedSerial.split(",")
        print(yolo[0], yolo[1])
    except:
        print("Keyboard Interrupt")
        break


