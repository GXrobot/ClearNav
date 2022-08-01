#!/usr/bin/env python3

# https://github.com/adafruit/Adafruit_CircuitPython_GPS/blob/main/examples/gps_simpletest.py
# read data through ttyUSB0 port
# print gps info at specified rate

import time
import serial
import adafruit_gps

uart = serial.Serial(
        # try ports ttyS0, ttyUSB0, ttyAMA0 if not working
        port='/dev/ttyS0',                # read/write sereal port
        baudrate = 9600,                    # data transfer: 9500 bits per second
        parity=serial.PARITY_NONE,          # no parity checking
        stopbits=serial.STOPBITS_ONE,       # indicates end of data transmission
        bytesize=serial.EIGHTBITS,          # number of data bits
        timeout=5                           # n seconds before timing out
)

gps = adafruit_gps.GPS(uart, debug=False)  # Use UART/pyserial

# Initialize the GPS module by changing what data it sends and at what rate.
# Turn on the basic GGA and RMC info (what you typically want)
gps.send_command(b"PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0")

# Set update rate to once a second (1hz)
gps.send_command(b"PMTK220,1000")

# Main loop
last_print = time.monotonic()
while True:

    # Every second print out current location details if there's a fix.
    gps.update()
    current = time.monotonic()
    if current - last_print >= 1.0:
        last_print = current

        # no fix yet
        if not gps.has_fix:
            print("Waiting for fix...")
            continue

        # parse raw GPS NMEA sentence
        print("=" * 40)  # Print a separator line.
        print(
            "Fix timestamp: {}/{}/{} {:02}:{:02}:{:02}".format(
                gps.timestamp_utc.tm_mon,  # Grab parts of the time from the
                gps.timestamp_utc.tm_mday,  # struct_time object that holds
                gps.timestamp_utc.tm_year,  # the fix time.  Note you might
                gps.timestamp_utc.tm_hour,  # not get all data like year, day,
                gps.timestamp_utc.tm_min,  # month!
                gps.timestamp_utc.tm_sec,
            )
        )
        print("Latitude: {0:.6f} degrees".format(gps.latitude))
        print("Longitude: {0:.6f} degrees".format(gps.longitude))
        print("Fix quality: {}".format(gps.fix_quality))

        if gps.satellites is not None:
            print("# satellites: {}".format(gps.satellites))
        if gps.altitude_m is not None:
            print("Altitude: {} meters".format(gps.altitude_m))
        if gps.speed_knots is not None:
            print("Speed: {} km/h".format(gps.speed_knots * 1.852))
        if gps.track_angle_deg is not None:
            print("Track angle: {} degrees".format(gps.track_angle_deg))
        if gps.horizontal_dilution is not None:
            print("Horizontal dilution: {}".format(gps.horizontal_dilution))
        if gps.height_geoid is not None:
            print("Height geoid: {} meters".format(gps.height_geoid))
