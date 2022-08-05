#!/usr/bin/env python3

import signal
import sys
import subprocess
import RPi.GPIO as GPIO

BTN_GPIO = 8
DEBOUNCE_TIME = 100 # ms

def signal_handler(sig, frame):
	print("signal_handler: Called")
	GPIO.cleanup()
	sys.exit(130)

def btn_irq(channel):

	print('btn_irq: called')

	subprocess.Popen(["xdotool", "key", "alt+Tab"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def main():

	GPIO.setmode(GPIO.BCM)
	GPIO.setup(BTN_GPIO, GPIO.IN, pull_up_down=GPIO.PUD_UP)

	GPIO.add_event_detect(BTN_GPIO, GPIO.FALLING, callback=btn_irq, bouncetime=DEBOUNCE_TIME)

	signal.signal(signal.SIGINT, signal_handler)
	signal.pause()

if __name__ == '__main__':
	main()
