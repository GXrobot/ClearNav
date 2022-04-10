#!/bin/bash
# This script adds a service for the EZhud web server and cofigures systemd to
# start the server on boot

csmt system unlock
sudo cp ./ezhud-webserver.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ezhud-webserver.service
sync
csmt system lock
