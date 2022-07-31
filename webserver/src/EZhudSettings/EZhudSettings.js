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
		'wifi_country': getWifiCountry(),
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
	var rebootNeeded = false;

	// Iterate through each setting given
	// For loop because we only expect entries for settings that have changed
	for( const [key, value] of Object.entries(newSettings) ) {

		// TODO: Put the functions into a dictionary to get rid of this switch case
		switch(key) {
			case 'wifi_country':
				console.log('setEZhudSettings(): wifi_country');
				//setWifiCountry(value);
				rebootNeede = true;
				break;
			case 'wifi_ssid':
				console.log('setEZhudSettings(): wifi_ssid');
				setWifiSSID(value);
				rebootNeeded = true;
				break;
			case 'wifi_psk':
				console.log('setEZhudSettings(): wifi_psk');
				setWifiPSK(value);
				rebootNeeded = true;
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
	if( rebootNeeded ) {
		// Call the reboot via an async call to allow time for the server to return the updated settings to the client
		exec('sleep 5; sudo reboot');
	}
	
	return getEZhudSettings();

}

// get all .mp4 files in filesystem generated from dashcam
// function is used to populate dashcam html page
function getAllVideoFiles() {
    console.log('getAllVideoFiles() called');

    const fileList = [];
    fs.readdir(RECORD_DIR, function (err, files) {

        if (err) {
            return console.log('Unable to read directory: ' + err);
        } 

        
        files.forEach(function (file) {

            // check for mp4 files here
            
            fileList.push(file);
        });
    });

    return fileList;
}

// get specific video file
// function is used when user clicks specific video file
function fetchVideoFile(file) {
    console.log('fetchVideoFile() called');
    // TODO
}

// TODO: Fix later
function getWifiMode() {

	console.log('	getWifiMode()');

	return 'Client';

	var bashCmd = `grep ${CS_ENV_FILE} -e ENABLE_HOTSPOT`;
	var wifiMode = 'Error';

	try {
		var res = execSync(bashCmd);
		console.log(`	getWifiMode(): res.toString()=${res.toString()}`);
		let hotspotEnabled = (res.toString().split('='))[1];
		console.log(`	getWifiMode(): hotspotEnabled=${hotspotEnabled}`);
		wifiMode = (hotspotEnabled == 1) ? 'hotspot' : 'client';
		console.log(`	getWifiMode(): wifiMode=${wifiMode}`);
	} catch(err) {
		console.log('	getWifiMode(): err', err);
		console.log('	getWifiMode(): stderr', err.stderr.toString());
	}

	return wifiMode;

}

// TODO: Fix later
function setWifiMode(mode) {

	console.log('	setWifiMode()');

	return 0;

	if( mode != 'hotspot' && mode != 'client' ) {
		console.log(`	setWifiMode(): Unexpected wifi mode: ${mode}`);
		return 1;
	}

	// Wifi mode can be set through crankshaft_env.sh
	if( mode == 'hotspot' ) {
		// TODO: Should the previous client ssid and psk be saved?
		try {
			// Set hotspot mode
			execSync(`sudo sed -i 's/ENABLE_HOTSPOT=0/ENABLE_HOTSPOT=1/' ${CS_ENV_FILE}`);
			// Unset client ssid and psk
			execSync(`sudo sed -i 's/WIFI_SSID=.*/WIFI_SSID="sample"/' ${CS_ENV_FILE}`);
			execSync(`sudo sed -i 's/WIFI_PSK=.*/WIFI_PSK="sample"/' ${CS_ENV_FILE}`);
			execSync(`sudo sed -i 's/WIFI2_SSID=.*/WIFI2_SSID="sample"/' ${CS_ENV_FILE}`);
			execSync(`sudo sed -i 's/WIFI2_PSK=.*/WIFI2_PSK="sample"/' ${CS_ENV_FILE}`);
			// Force recreate wpa_supplicant.conf update
			execSync(`sudo sed -i 's/WIFI_UPDATE_CONFIG=0/WIFI_UPDATE_CONFIG=1/' ${CS_ENV_FILE}`);
			return 0;
		} catch(err) {
			console.log('	setWifiMode(): Failed to set hotspot mode');
			console.log('	setWifiMode(): err', err);
			console.log('	setWifiMode(): stderr', err.stderr.toString());
		}
	} else if( mode == 'client' ) {
		try {
			// Disable hotspot
			execSync(`sudo sed -i 's/ENABLE_HOTSPOT=1/ENABLE_HOTSPOT=0/' ${CS_ENV_FILE}`);
			// At this point we cannot know for sure what the wifi credentials will be
			// Leave them blank. Also means no point in forcing a wpa_supplicant.conf refresh
			// res = execSync(`sudo sed -i 's/WIFI_UPDATE_CONFIG=*/WIFI_UPDATE_CONFIG=1/' ${CS_ENV_FILE}`);
			return 0;
		} catch(err) {
			console.log('	setWifiMode(): Failed to set client mode');
			console.log('	setWifiMode(): err', err);
			console.log('	setWifiMode(): stderr', err.stderr.toString());
		}
	} else {
		console.log(`	setWifiMode(): Unexpected wifi mode: ${mode}`);
		return 1;
	}

	return 1;

}

// TODO: Fix later
function getWifiCountry() {

	console.log('	getWifiCountry()');

	var wifiCountry = 'Error';

	try {
		let res = execSync('sudo wpa_cli -i wlan0 get country');
		wifiCountry = res.toString();
		console.log(`	getWifiCountry(): wifiCOuntry=${wifiCountry}`);
	} catch(err) {
		console.log('	getWifiCountry(): err', err);
		console.log('	getWifiCountry: stderr', err.stderr.tostring());
	}

	return wifiCountry;

}

// TODO: Fix later
function setWifiCountry(country) {

	console.log('	setWifiCountry()');

	return 0;

	// Could replace this with a comparison against a list since the accepted codes are known
	if( !(country.match(/^[A-Z][A_Z]$/)) ) {
		console.log(`	setWifiCountry(): Unexpected country: ${country}`);
		return 1;
	}

	var bashCmd = '';

	if( getWifiMode() == 'hotspot' ) {
		console.log(`	setWifiCountry(): Setting hotspot country to ${country}`);
		try {
			execSync(`sudo sed -i 's/country_code=[A-Z][A-Z]/country_code=${country}/' ${HOSTAPD_CONF}`);
		} catch(err) {
			console.log('	setWifiCountry(): Failed to set hotspot country');
			console.log('	setWifiCountry(): err', err);
			console.log('	setWifiCountry(): stderr', err.stderr.toString());
			return 1;
		}
	} else {
		console.log(`	setWifiCountry(): Setting client country to ${country}`);
		try {
			execSync(`sudo sed -i 's/WIFI_COUNTRY=[A-Z][A-Z]/WIFI_COUNTRY=${country}/' ${CS_ENV_FILE}`);
			execSync(`sudo sed -i 's/WIFI_UPDATE_CONFIG=0/WIFI_UPDATE_CONFIG=1/' ${CS_ENV_FILE}`);
		} catch(err) {
			console.log('	setWifiCountry(): Failed to set client country');
			console.log('	setWifiCountry(): err', err);
			console.log('	setWifiCountry(): stderr', err.stderr.toString());
			return 1;
		}
	}

	return 0;

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

	// This variable is useless. Rewrite as in getWifiPSK()?
	var bashCmd = '';

	if( getWifiMode() == 'hotspot' ) {
		console.log(`	setWifiSSID(): Setting hotspot Wifi SSID to ${ssid}`);			
		try {
			execSync(`sudo sed -i 's/ssid=.*/ssid=${ssid}/' ${HOSTAPD_CONF}`);
		} catch(err) {
			console.log('	setWifiSSID(): Failed to set hotspot SSID');
			console.log('	setWifiSSID(): err', err);
			console.log('	setWifiSSID(): stderr', err.stderr.toString());
			return 1;
		}
	} else {
		console.log(`	setWifiSSID(): Setting client Wifi SSID to ${ssid}`);			
		try {
			execSync(`sudo sed -i 's/WIFI_SSID=.*/WIFI_SSID="${ssid}"/' ${CS_ENV_FILE}`);
			execSync(`sudo sed -i 's/WIFI_UPDATE_CONFIG=0/WIFI_UPDATE_CONFIG=1/' ${CS_ENV_FILE}`);
		} catch(err) {
			console.log('	setWifiSSID(): Failed to set client SSID');
			console.log('	setWifiSSID(): err', err);
			console.log('	setWifiSSID(): stderr', err.stderr.toString());
			return 1;
		}
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

	// This variable is useless. Rewrite as in getWifiPSK()?
	var bashCmd = '';

	if( getWifiMode() == 'hotspot' ) {
		console.log(`	setWifiPSK(): Setting hotspot PSK to ${psk}`);
		try {
			execSync(`sudo sed -i 's/wpa_passphrase=.*/wpa_passphrase=${psk}/' ${HOSTAPD_CONF}`);
		} catch(err) {
			console.log(`	setWifiPSK(): Failed to set hotspot PSK`);
			console.log('	setWifiPSK(): err', err);
			console.log('	setWifiPSK(): stderr', err.stderr.toString());
			return 1;
		}
	} else {
		console.log(`	setWifiPSK(): Setting client PSK to ${psk}`);
		try {
			execSync(`sudo sed -i 's/WIFI_PSK=.*/WIFI_PSK="${psk}"/' ${CS_ENV_FILE}`);
			execSync(`sudo sed -i 's/WIFI_UPDATE_CONFIG=0/WIFI_UPDATE_CONFIG=1/' ${CS_ENV_FILE}`);
		} catch(err) {
			console.log(`	setWifiPSK(): Failed to set client PSK`);
			console.log('	setWifiPSK(): err', err);
			console.log('	setWifiPSK(): stderr', err.stderr.toString());
			return 1;
		}
	}

	return 0;

}

module.exports = {
	getEZhudSettings,
	setEZhudSettings,
    getAllVideoFiles,
    fetchVideoFile
}
