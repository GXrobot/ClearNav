#!/usr/bin/env python3

import dbus
import dbus.service
import dbus.mainloop.glib
from gi.repository import GLib

import signal
import sys
import os
import RPi.GPIO as GPIO
from time import sleep
# Use multiprocessing instead of threading because the GIL prevents actual multithreading
from multiprocessing import Process, RLock, Value
from ctypes import c_bool

BUS_NAME = 'org.bluez'
ADAPTER_IFACE = 'org.bluez.Adapter1'
ADAPTER_ROOT = '/org/bluez/hci'
AGENT_IFACE = 'org.bluez.Agent1'
AGNT_MNGR_IFACE = 'org.bluez.AgentManager1'
AGENT_PATH = '/my/app/agent'
AGNT_MNGR_PATH = '/org/bluez'
CAPABILITY = 'KeyboardDisplay'
DEVICE_IFACE = 'org.bluez.Device1'
dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)
bus = dbus.SystemBus()

PAIRING_TIMEOUT = 3600
DEBOUNCE_TIME = 250
BT_GPIO = 16

currentlyPairing = Value(c_bool, False)
pairLock = RLock() # Not sure if this is needed or Lock() is ok



def set_trusted(path):
	props = dbus.Interface(bus.get_object(BUS_NAME, path), dbus.PROPERTIES_IFACE)
	props.Set(DEVICE_IFACE, "Trusted", True)

class Agent(dbus.service.Object):

	@dbus.service.method(AGENT_IFACE,
						 in_signature="", out_signature="")
	def Release(self):
		print("Release")

	@dbus.service.method(AGENT_IFACE,
						 in_signature='o', out_signature='s')
	def RequestPinCode(self, device):
		print(f'RequestPinCode {device}')
		return '0000'

	@dbus.service.method(AGENT_IFACE,
						 in_signature="ou", out_signature="")
	def RequestConfirmation(self, device, passkey):
		print("RequestConfirmation (%s, %06d)" % (device, passkey))
		set_trusted(device)
		return

	@dbus.service.method(AGENT_IFACE,
						 in_signature="o", out_signature="")
	def RequestAuthorization(self, device):
		print("RequestAuthorization (%s)" % (device))
		auth = input("Authorize? (yes/no): ")
		if (auth == "yes"):
			return
		raise Rejected("Pairing rejected")

	@dbus.service.method(AGENT_IFACE,
						 in_signature="o", out_signature="u")
	def RequestPasskey(self, device):
		print("RequestPasskey (%s)" % (device))
		set_trusted(device)
		passkey = input("Enter passkey: ")
		return dbus.UInt32(passkey)

	@dbus.service.method(AGENT_IFACE,
						 in_signature="ouq", out_signature="")
	def DisplayPasskey(self, device, passkey, entered):
		print("DisplayPasskey (%s, %06u entered %u)" %
			  (device, passkey, entered))

	@dbus.service.method(AGENT_IFACE,
						 in_signature="os", out_signature="")
	def DisplayPinCode(self, device, pincode):
		print("DisplayPinCode (%s, %s)" % (device, pincode))

class Adapter:
	def __init__(self, idx=0):
		bus = dbus.SystemBus()
		self.path = f'{ADAPTER_ROOT}{idx}'
		self.adapter_object = bus.get_object(BUS_NAME, self.path)
		self.adapter_props = dbus.Interface(self.adapter_object,
											dbus.PROPERTIES_IFACE)
		self.adapter_props.Set(ADAPTER_IFACE,
							   'DiscoverableTimeout', dbus.UInt32(PAIRING_TIMEOUT))
		self.adapter_props.Set(ADAPTER_IFACE,
							   'Discoverable', True)
		self.adapter_props.Set(ADAPTER_IFACE,
							   'PairableTimeout', dbus.UInt32(PAIRING_TIMEOUT))
		self.adapter_props.Set(ADAPTER_IFACE,
							   'Pairable', True)

def allow_pairing():
	agent = Agent(bus, AGENT_PATH)
	agnt_mngr = dbus.Interface(bus.get_object(BUS_NAME, AGNT_MNGR_PATH),
							   AGNT_MNGR_IFACE)
	agnt_mngr.RegisterAgent(AGENT_PATH, CAPABILITY)
	agnt_mngr.RequestDefaultAgent(AGENT_PATH)

	adapter = Adapter()
	mainloop = GLib.MainLoop()
	GLib.timeout_add_seconds(PAIRING_TIMEOUT, GLib.MainLoop.quit, mainloop)
	try:
		mainloop.run()
	except KeyboardInterrupt:
		agnt_mngr.UnregisterAgent(AGENT_PATH)
		mainloop.quit()



def signal_handler(sig, frame):
	GPIO.cleanup()
	sys.exit(130)

def start_pairing():

	global currentlyPairing
	global pairLock

	allow_pairing()

	pairLock.acquire()
	currentlyPairing.value = False
	pairLock.release()

# Could be moved into __main__
def blink_LED():

	global currentlyPairing
	global pairLock

	while True:
		pairLock.acquire()
		if currentlyPairing.value:
			pairLock.release() # Release here to avoid holding lock for 1s
			os.system("echo 192 > sudo tee /sys/class/leds/led0/brightness")
			sleep(1)
			os.system("echo 0 > sudo tee /sys/class/leds/led0/brightness")
			sleep(1)
		else:
			pairLock.release() # The above release only runs if still pairing
			break

def bt_irq(channel):

	global currentlyPairing
	global pairLock

	pairLock.acquire()
	if not currentlyPairing.value:
		currentlyPairing.value = True
		btProcess = Process(target=start_pairing)
		btProcess.start()
		ledProcess = Process(target=blink_LED)
		ledProcess.start()

	pairLock.release()

def main():
	
	GPIO.setmode(GPIO.BCM)
	GPIO.setup(BT_GPIO, GPIO.IN, pull_up_down=GPIO.PUD_UP)

	os.system("echo gpio > sudo tee /sys/class/leds/led0/trigger")

	GPIO.add_event_detect(BT_GPIO, GPIO.FALLING, callback=bt_irq, bouncetime=DEBOUNCE_TIME)

	signal.signal(signal.SIGINT, signal_handler)
	signal.pause()

if __name__ == '__main__':
	main()
