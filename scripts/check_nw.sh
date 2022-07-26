#!/bin/bash

# Need to wait for then network to connect and give us an IPv4 address
sleep 20
ipaddr=$(ifconfig wlan0 | grep -c "inet ")
if [ "$ipaddr" -eq "0" ]
then
	logger "No network detected. Switching to AP mode"
	sudo /home/pi/Documents/ap_mode.sh
fi

