To use the web server:
- Install Node.JS:
```
sudo apt install curl
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash -
sudo apt install nodejs -y
```
- Clone the repo: `git clone git@github.com:GXrobot/ClearNav.git`
- Enter the web server directory: `cd ClearNav/webserver`
- Install dependencies using package.json: `npm install`

To start the web server:
1. Set the web server up as a service that automatically starts on system boot: `../setup_webserver_service.sh`
2. Start the web server manually (using port 80 requires root permission): `sudo node app.js`

