#!/bin/bash

# Both the rotate and our GPS UI need some time before they work correctly
sleep 3

# For the 4" screen
scrn=$(xrandr | grep -c 'HDMI-1 connected primary 480x800+0+0')
if [ "$scrn" -eq "1" ]; then
	xrandr --output HDMI-1 --rotate left
fi

# OpenDash's own service is broken, start ourselves
/home/pi/dash/bin/dash &
/home/pi/ClearNav/scripts/serial_read_gui.py &
/home/pi/ClearNav/scripts/check_nw.sh &
/home/pi/ClearNav/scripts/swap_windows.py &
#/home/pi/ClearNav/scripts/bt_pair.py &

camera=$(vcgencmd get_camera | grep -c "detected=1")
if [ "$camera" -eq "1" ]; then
	/home/pi/ClearNav/scripts/record.py &
fi

