#!/bin/bash

# Init the Pi GPIO daemon
sudo pigpiod

# Set pin 12 to output
pigs modes 12 w

# Pulse pin 12 high to turn on the VuFine
pigs w 12 0
sleep 1
pigs w 12 1
sleep 1
pigs w 12 0

exit 0

