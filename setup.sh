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

# Skip starting OpenDash when it is built
# It blocks the rest of the script until stopped
sed -i 's/cd ..\/bin/#cd ../bin/' ./install.sh
sed -i 's/.\/dash/#.\/dash/' ./install.sh

./install.sh

# Change some settings

echo "Hiding menubar"
sudo sed -i 's/autohide=./autohide=1/' /home/pi/.config/lxpanel/LXDE-pi/panels/panel
sudo sed -i 's/heightwhenhidden=./heightwhenhidden=1/' /home/pi/.config/lxpanel/LXDE-pi/panels/panel

echo "Setting boot splash"
sudo cp /usr/share/plymouth/themes/pix/splash.png /usr/share/plymouth/themes/pix/splash.png.background
sudo cp /home/pi/ClearNav/webserver/src/assets/logo.png /usr/share/plymouth/themes/pix/splash.png

echo "Setting desktop background"
sudo sed -i 's@wallpaper=.*@wallpaper=/usr/share/plymouth/themes/pix/splash.png@' /etc/xdg/pcmanfm/LXDE-pi/desktop-items-0.conf
sudo sed -i 's/wallpaper_mode=.*/wallpaper_mode=fit/' /etc/xdg/pcmanfm/LXDE-pi/desktop-items-0.conf

echo "Hiding trash bin"
sudo sed -i 's/show_trash=.*/show_trash=0/' /etc/xdg/pcmanfm/LXDE-pi/desktop-items-0.conf

echo "Enabling legacy camera"
sudo raspi-config nonint do_legacy 0

echo "Enabling UART"
sudo raspi-config nonint do_serial 2

echo "Disabling screen blanking"
sudo raspi-config nonint do_blanking 1

echo "Setting WiFi country"
sudo raspi-config nonint do_wifi_country CA

echo "Setting time zone"
sudo raspi-config nonint do_change_timezone PST8PDT

# The WaveShare CM4-NANO-B requires a custom device tree for camera support
echo "Copying over device tree"
sudo cp WS-dt-blob.bin /boot/dt-blob.bin

# Set HDMI boost to 7
# Not able to find raspi-config switch for this
echo "Setting HDMI boost"

if grep -qE "^#?config_hdmi_boost=[01234567]" /boot/config.txt; then
	sudo sed -i 's/^#\?config_hdmi_boost=[01234567]/config_hdmi_boost=7/' /boot/config.txt
else
	sudo bash -c "echo 'config_hdmi_boost=7' >> /boot/config.txt"
fi

# Enable the USB port on the CM4
# Not able to find raspi-config switch for this
echo "Enabling CM4 USB"

sudo sed -i 's/^#\?otg_mode=[01]//' /boot/config.txt

if grep -qE "^#?dtoverlay=dwc2,dr_mode=.*" /boot/config.txt; then
	sudo sed -i 's/^#\?dtoverlay=dwc2,dr_mode=.*/dtoverlay=dwc2,dr_mode=host/' /boot/config.txt
else
	sudo bash -c "echo 'dtoverlay=dwc2,dr_mode=host' >> /boot/config.txt"
fi

# Change hostname
echo "Changing hostname"
sudo raspi-config nonint do_hostname 'EZhud'

sync

echo "Rebooting"
sleep 5
sudo reboot

exit 0
