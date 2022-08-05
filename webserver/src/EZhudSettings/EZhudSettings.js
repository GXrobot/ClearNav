const fs = require('fs');
const path = require('path');
const RECORD_DIR = "/home/pi/recordings";
const {exec, execSync} = require('child_process');

const WPA_CONF_FILE = '/etc/wpa_supplicant/wpa_supplicant.conf';
const HOSTAPD_CONF = '/etc/hostapd/hostapd.conf';


// Gets all system settings supported by the mobile application in JSON format
function getEZhudSettings() {

	console.log('getEZhudSettings() called');

	var currentSettings = {
		'wifi_ssid': getWifiSSID(),
		'wifi_psk': getWifiPSK()
	};

	console.log(`getEZhudSettings(): Returning ${JSON.stringify(currentSettings)}`);

	return JSON.stringify(currentSettings);
}

// Sets system settings given and returns the updated values in JSON format
// Expects the req.body from the POST request to be passed in unmodified
function setEZhudSettings(newSettings) {

	console.log('setEZhudSettings()');

	// Iterate through each setting given
	// For loop because we only expect entries for settings that have changed
	for( const [key, value] of Object.entries(newSettings) ) {

		// TODO: Put the functions into a dictionary to get rid of this switch case
		switch(key) {
			case 'wifi_ssid':
				console.log('setEZhudSettings(): wifi_ssid');
				setWifiSSID(value);
				break;
			case 'wifi_psk':
				console.log('setEZhudSettings(): wifi_psk');
				setWifiPSK(value);
				break;
			default:
				console.log(`setEZhudSettings(): Unexpected key pair [${key}, ${value}]`);
		}

	}

	try {
		execSync('sync');
	} catch(err) {
		console.log('setEZhudSettings(): Failed to flush changes to disk');
		console.log('setEZhudSettings(): err', err);
		console.log('setEZhudSettings(): stderr', err.stderr.toString());
	}

	// Trigger a system reboot when we change wifi settings
	// Call the reboot via an async call to allow time for the server to return the updated settings to the client
	exec('sleep 5; sudo reboot');
	
	return getEZhudSettings();

}

// TODO: Fix later
function getWifiSSID() {

	console.log('	getWifiSSID()');

	return 'WiFi';

	var bashCmd = '';
	var wifiSSID = 'Error';

	if( getWifiMode() == 'hotspot' ) {
		bashCmd = `grep ${HOSTAPD_CONF} -e ssid`;
	} else {
		bashCmd = `grep ${CS_ENV_FILE} -e WIFI_SSID`;
	}

	console.log(`	getWifiSSID(): bashCmd=${bashCmd}`);

	try {

		let res = execSync(bashCmd);
		console.log(`	getWifiSSID(): res.toString()=${res.toString()}`);
		wifiSSID = res.toString().replace(/["\n]+/g, '').split('=')[1];
		console.log(`	getWifiSSID(): wifiSSID=${wifiSSID}`);

	} catch(err) {

	}

	return wifiSSID;

}

// TODO: Allow setting AP mode SSID?
function setWifiSSID(ssid) {

	console.log('	setWifiSSID()');

	// https://stackoverflow.com/questions/4919889/is-there-a-standard-that-defines-what-is-a-valid-ssid-and-password
	// Any 0 to 32 length 'string' is allowed
	if( ssid.length > 32 ) {
		console.log(`	setWifiSSID(): Invalid length SSID: ${ssid}:${ssid.length}`);
		return 1;
	}

	try{
		execSync(`sudo sed -i 's/ssid=.*/ssid="${ssid}"/' ${WPA_CONF_FILE}`);
	} catch(err) {
		console.log('	setWifiSSID(): Failed to set SSID');
		console.log('	setWifiSSID(): err', err);
		console.log('	setWifiSSID(): stderr', err.stderr.toString());
		return 1;
	}

	return 0;

}

// TODO: Fix later
function getWifiPSK() {

	console.log('	getWifiPSK()');

	return 'password';

	var bashCmd = '';
	var wifiPSK = 'Error';

	if( getWifiMode() == 'hotspot' ) {
		bashCmd = `grep ${HOSTAPD_CONF} -e wpa_passphrase`; 	
	} else {
		bashCmd = `grep ${CS_ENV_FILE} -e WIFI_PSK`;
	}

	console.log(`	getWifiPSK(): bashCmd=${bashCmd}`);

	try {
		let res = execSync(bashCmd);
		console.log(`	getWifiPSK(): res.toString()=${res.toString()}`);
		wifiPSK = res.toString().replace(/["\n]+/g, '').split('=')[1];
		console.log(`	getWifiPSK(): wifiPSK=${wifiPSK}`);
	} catch(err) {
		console.log('	getWifiPSK(): err', err);
		console.log('	getWifiPSK(): stderr', err.stderr.toString());
	}

	return wifiPSK;

}

// TODO: Allow setting AP mode PSK?
function setWifiPSK(psk) {

	console.log('	setWifiPSK()');

	// Password validation?
	// https://w1.fi/cgit/hostap/plain/hostapd/hostapd.conf
	
	try{
		execSync(`sudo sed -i 's/psk=.*/psk="${psk}"/' ${WPA_CONF_FILE}`);
	} catch(err) {
		console.log(`	setWifiPSK(): Failed to set PSK`);
		console.log('	setWifiPSK(): err', err);
		console.log('	setWifiPSK(): stderr', err.stderr.toString());
		return 1;
	}

	return 0;

}

module.exports = {
	getEZhudSettings,
	setEZhudSettings,
}
