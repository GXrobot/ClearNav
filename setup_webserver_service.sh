#!/bin/bash
# This script adds a service for the EZhud web server and cofigures systemd to
# start the server on boot

sudo cp ./ezhud-webserver.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ezhud-webserver.service
# stdout for the server technically never stops
# This causes systemctl restart to hang
sudo systemctl restart ezhud-webserver.service &
sync
