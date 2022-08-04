#!/usr/bin/env python3

# https://github.com/adafruit/Adafruit_CircuitPython_GPS/blob/main/examples/gps_simpletest.py
# read data through ttyUSB0 port
# print gps info at specified rate
# GPS set to update at 2hz
# GUI updates much faster

import time
import serial
import adafruit_gps
import PySimpleGUI as sg
import subprocess
import os

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

# setup PySimpleGUI window
sg.theme('DarkAmber')

layout = [
    [sg.Text('')], 
    [sg.Text(size=(80, 2), font=('Helvetica', 25), text_color='White', justification='center', key='info_bar')],
    [sg.VPush()], 
    [sg.Text(size=(8, 2), font=('Helvetica', 75), text_color='White', justification='center', key='speed')],
    [sg.VPush()],
    [sg.Text(size=(80, 2), font=('Helvetica', 25), text_color='White', justification='center', key='address')]
]

window = sg.Window('GPS Demo', layout, size=sg.Window.get_screen_size(), keep_on_top=None, element_justification='c')

# Initialize the GPS module
gps.send_command(b"PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0")  # Turn on the basic GGA and RMC info (what you typically want)
gps.send_command(b"PMTK220,1000")   # Set update rate to once a second (1hz)

# Main loop
current_speed = 0
num_satelites = 0
CONVERSION_FACTOR = 1.852       # knots to km/h
last_print = time.monotonic()
while True:

    # --------- read and update window ---------
    event, values = window.read(timeout=10)

    # --------- update GPS values ---------
    gps.update()
    current = time.monotonic()
    if current - last_print >= 1.0:
        last_print = current

    if not gps.has_fix:
        current_speed = "Weak Signal"

    if gps.satellites is not None:
        num_satelites = gps.satellites
    if gps.speed_knots is not None:
        current_speed = round(gps.speed_knots * CONVERSION_FACTOR)
        if current_speed < 5: current_speed = 0

    # --------- display speed in window ---------
    window['speed'].update(str(current_speed) + " km/h")

    # --------- display info_bar in window ---------
    # map range (0-22) to range (0-100%)
    signal = round((num_satelites / float(22)) * float(100))

    if os.path.isfile("/tmp/recording"):
        recording_status = "recording"
    else:
        recording_status = "not recording"

    window['info_bar'].update("Signal: " + str(signal) + "%, " + "Dashcam: " + recording_status)

    # --------- display ip address in window ---------
    ip_address = subprocess.check_output(['hostname', '--all-ip-addresses']).decode("utf-8").split(' ' )[0]
    window['address'].update("IP ADDRESS: " + str(ip_address))

    # End program if user closes window or presses the OK button
    if event == "Close" or event == sg.WIN_CLOSED:
        break

window.close()
