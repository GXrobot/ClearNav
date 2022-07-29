#!/bin/bash

# Update device
sudo apt update && sudo apt upgrade -y

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

#sudo bash -c "echo '@bash /home/pi/ClearNav/scripts/log_stats.sh' >> /etc/xdg/lxsession/LXDE-pi/autostart"

cd /home/pi
git clone https://github.com/openDsh/dash.git

cd dash
./install.sh

# Change some settings
# All of these settings could be done through raspi-config

# Enable legacy camera
echo "Enabling camera"

if grep -qE "^#?start_x=[01]" /boot/config.txt; then
	sudo sed -i 's/^#\?start_x=[01]/start_x=1/' /boot/config.txt
else
	sudo bash -c "echo 'start_x=1' >> /boot/config.txt"
fi

if grep -qE "^#?gpu_mem=[1234567890]*" /boot/config.txt; then
	sudo sed -i 's/^#\?gpu_mem=[1234567890]*/gpu_mem=128/' /boot/config.txt
else
	sudo bash -c "echo 'gpu_mem=128' >> /boot/config.txt"
fi

# The WaveShare CM4-NANO-B requires a custom device tree for camera support
echo "Copying over device tree"
sudo cp WS-dt-blob.bin /boot/dt-blob.bin

# Every time we configure the Pi manually raspi-config switches from KMS to Fake KMS
echo "Changing to fkms"
if grep -qE "^#?dtoverlay=vc4-f?kms-v3d" /boot/config.txt; then
	sudo sed -i 's/^#\?dtoverlay=vc4-f\?kms-v3d/dtoverlay=vc4-fkms-v3d/' /boot/config.txt
else
	sudo bash -c "echo 'dtoverlay=vc4-fkms-v3d' >> /boot/config.txt"
fi

# Enable UART
echo "Enabling UART"
if grep -qE "^#?enable_uart=[01]" /boot/config.txt; then
	sudo sed -i 's/^#\?enable_uart=[01]/enable_uart=1/' /boot/config.txt
else
	sudo bash -c "echo 'enable_uart=1' >> /boot/config.txt"
fi

# Set HDMI boost to 7
echo "Setting HDMI boost"
if grep -qE "^#?config_hdmi_boost=[01234567]" /boot/config.txt; then
	sudo sed -i 's/^#\?config_hdmi_boost=[01234567]/config_hdmi_boost=7/' /boot/config.txt
else
	sudo bash -c "echo 'config_hdmi_boost=7' >> /boot/config.txt"
fi

# Disable screen blanking
# This is copied from raspi-config
echo "Disabling screen blanking"
sudo rm -f /etc/X11/xorg.conf.d/10-blanking.conf
sudo sed -i '/^\o033/d' /etc/issue
sudo mkdir /etc/X11/xorg.conf.d/
sudo cp /usr/share/raspi-config/10-blanking.conf /etc/X11/xorg.conf.d/
sudo bash -c "printf '\\033[9:0]' >> /etc/issue"

# Set menubar to autohide
echo "Hiding menubar"
sudo sed -i 's/autohide=./autohide=1/' /home/pi/.config/lxpanel/LXDE-pi/panels/panel
sudo sed -i 's/heightwhenhidden=./heightwhenhidden=1/' /home/pi/.config/lxpanel/LXDE-pi/panels/panel

# Enable the USB port on the CM4
echo "Enabling CM4 USB"
if grep -qE "^#?dtoverlay=dwc2,dr_mode=.*" /boot/config.txt; then
	sudo sed -i 's/^#\?dtoverlay=dwc2,dr_mode=.*/dtoverlay=dwc2,dr_mode=host/' /boot/config.txt
else
	sudo bash -c "echo 'dtoverlay=dwc2,dr_mode=host' >> /boot/config.txt"
fi

# Change hostname
echo "Changing hostname"

# Echoing into /etc/hostname doesn't work unless the script is called by root
sudo sed -i 's/.*/EZhud/' /etc/hostname
sudo sed -i 's/127.0.1.1.*/127.0.1.1\tEZhud/g' /etc/hosts

# Right click on the menu bar and select 'Panel Settings'
# Under 'Advanced', check 'Minimuze panel when not in use'
# and set 'Size when minimized' to 0

sync

echo "Rebooting"
sleep 5
sudo reboot

exit 0

