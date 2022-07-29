#!/bin/bash

# For the 4" screen
scrn=$(xrandr | grep -c 'HDMI-1 connected primary 480x800+0+0')
if [ "$scrn" -eq "1" ]; then
	# Rotating the screen needs a slightly longer wait, otherwise UI may grab vertical sizes
	sleep 3
	xrandr --output HDMI-1 --rotate left
else
	# Need a wait to avoid menubar issues
	# 1 second only lets us see a blurred desktop background before UI loads
	sleep 1
fi

# OpenDash's own service is broken, start ourselves
/home/pi/dash/bin/dash &
/home/pi/ClearNav/GPS/serial_read_gui.py &
/home/pi/ClearNav/scripts/check_nw.sh &
/home/pi/ClearNav/scripts/swap_windows.py &
#/home/pi/ClearNav/scripts/bt_pair.py &

camera=$(vcgencmd get_camera | grep -c "detected=1")
if [ "$camera" -eq "1" ]; then
	/home/pi/ClearNav/scripts/record.py &
fi

