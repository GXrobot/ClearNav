#!/bin/bash

# Update device
sudo apt update && sudo apt upgrade -y

# Change some settings
# Not sure how to do all of these programamtically

# In raspi-config:
# Change hostname to EZhud
# Enable serial hw interface
# Enable lgeacy camera
# Disable screen blanking

# Right click on the menu bar and select 'Panel Settings'
# Under 'Advanced', check 'Minimuze panel when not in use'
# and set 'Size when minimized' to 0

# In case this is running from ssh
export DISPLAY=:0

curl fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt install -y hostapd dnsmasq xdotool curl nodejs

sudo systemctl unmask hostapd.service
sudo systemctl disable hostapd.service
sudo systemctl disable dnsmasq.service

sudo bash -c "echo 'country_code=CA
driver=nl80211
interface=wlan0
ssid=EZhud
hw_mode=g
channel=7
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=clearnav
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
' > /etc/hostapd/hostapd.conf"

sudo bash -c "echo 'interface=wlan0
dhcp-range=10.0.1.2,10.0.1.20,255.255.255.0,24h
domain=wlan
address=/EZhud.com/10.0.1.1
' > /etc/dnsmasq.conf"

cd webserver
npm install

cd ..
pip3 install adafruit-circuitpython-gps PySimpleGUI

sudo bash -c "echo '[Unit]
Description=EZhud Web Server
After=network.target

[Service]
Type=forking
User=root
Restart=on-failure
WorkingDirectory=/home/pi/ClearNav/webserver
ExecStart=/usr/bin/node /home/pi/ClearNav/webserver/app.js

[Install]
WantedBy=multi-user.target
' > /etc/systemd/system/ezhud-webserver.service"

sudo systemctl daemon-reload
sudo systemctl enable ezhud-webserver.service

sudo bash -c "echo '[Desktop Entry]
Name=EZhudStartup
Exec=/bin/bash /home/pi/ClearNav/scripts/ezhud_startup.sh
' > /etc/xdg/autostart/display.desktop"

cd /home/pi
git clone https://github.com/openDsh/dash.git

cd dash
#git checkout cb073e60cf4adf95dad980e99f8be5ed76c654a1
./install.sh

exit 0

