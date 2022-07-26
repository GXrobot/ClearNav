#!/bin/bash
sudo killall wpa_supplicant
sudo ifconfig wlan0 down
sudo ifconfig wlan0 10.0.1.1 netmask 255.255.255.0 up
sudo systemctl restart dnsmasq.service
sudo systemctl restart hostapd.service
