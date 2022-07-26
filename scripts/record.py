#!/usr/bin/env python3

import picamera
import signal
import sys
import threading
import subprocess
import shutil
import os
import RPi.GPIO as GPIO
from datetime import datetime

CAM_GPIO = 20
RECORD_LENGTH = 5 * 60 # 5 minutes
DEBOUNCE_TIME = 250 # ms
RECORD_DIR = "/home/pi/recordings/"
FFMPEG_BIN = shutil.which('ffmpeg')
CONV_ALL_CMD = 'for i in %s*.h264; do ffmpeg -nostdin -i "$i" -vcodec copy "${i%%.*}.mp4"; rm "$i"; done' % RECORD_DIR

state_evt = threading.Event()
camera = picamera.PiCamera()
record = True

def signal_handler(sig, frame):
	print("signal_handler: Called")
	GPIO.cleanup()
	if camera.recording:
		print("signal_handler: Camera is recording. Stopping and converting all files")
		camera.stop_recording()
		subprocess.Popen(CONV_ALL_CMD, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
	camera.close()
	sys.exit(130)

def cam_irq(channel):
	global state_evt
	global camera
	global record

	print('cam_irq: called')

	if record:
		print('cam_irq: record=True, stopping recording, converting all files')
		record = False
		camera.stop_recording()
		subprocess.Popen(CONV_ALL_CMD, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
		print('cam_irq: record unset, camera stopped')
	else:
		print('cam_irq: record=False, starting recording')
		record = True
		state_evt.set()
		print('cam_irq: record set, state_evt set')

def main():

	global state_evt
	global camera
	global record

	GPIO.setmode(GPIO.BCM)
	GPIO.setup(CAM_GPIO, GPIO.IN, pull_up_down=GPIO.PUD_UP)

	GPIO.add_event_detect(CAM_GPIO, GPIO.FALLING, callback=cam_irq, bouncetime=DEBOUNCE_TIME)

	signal.signal(signal.SIGINT, signal_handler)

	if not os.path.isdir(RECORD_DIR):
		print("main: Creating records directory")
		os.mkdir(RECORD_DIR)

	# TODO: check if filesystem is full

	print(CONV_ALL_CMD)
	print(FFMPEG_BIN)

	# Since we are shutting down by cutting power there may be an unconverted video
	subprocess.Popen(CONV_ALL_CMD, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

	camera.resolution = (1280, 720)
	camera.framerate = 25

	while True:

		print('main: Top of loop')

		if not record:
			print('main: record=False, waiting for state_evt')
			state_evt.wait()
			print('main: state_evt set, unsetting')
			state_evt.clear()

		# Attach file extensions in the respective calls
		# Assumes system clock is correct. This may not be a valid assumption
		filename = RECORD_DIR + datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

		print(f"main: filename={filename}")
		
		print(f"main: Starting recording for {RECORD_LENGTH} seconds")
		camera.start_recording(filename + ".h264")
		camera.wait_recording(RECORD_LENGTH)
		if camera.recording: # May have stopped recording in the interrupt handler
			camera.stop_recording()

		print("main: Camera finished recording")

		# call() blocks, Popen() doesn't
		# There is a delay regardless in looping calls, this just lengthens it
		print(f"main: Calling : {shutil.which('ffmpeg')} -nostdin -i {filename}.h264 -vcodec copy {filename}.mp4; rm {filename}.h264")
		subprocess.Popen(f"{shutil.which('ffmpeg')} -nostdin -i {filename}.h264 -vcodec copy {filename}.mp4; rm {filename}.h264", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

if __name__ == '__main__':
	main()
