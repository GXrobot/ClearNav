const fs = require('fs');
const {execSync} = require('child_process');

const CS_ENV_FILE = '/boot/crankshaft/crankshaft_env.sh';
const HOSTAPD_CONF = '/etc/hostapd/hostapd.conf';

// Gets all system settings supported by the mobile application in JSON format
function getEZhudSettings() {

	console.log('getEZhudSettings() called');

	var currentSettings = {
		'brightness_mode': getBrightnessMode(),
		'brightness_level': getBrightnessLevel(),
		'wifi_mode': getWifiMode(),
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

	console.log('setEZhudSettings() called');
	var rebootNeeded = false;

	// Iterate through each setting given
	// For loop because we only expect entries for settings that have changed
	for( const [key, value] of Object.entries(newSettings) ) {

		// TODO: Put the functions into a dictionary to get rid of this switch case
		switch(key) {
			case 'brightness_mode':
				console.log('setEZhudSettings(): brightness_mode');
				setBrightnessMode(value);
				break;
			case 'brightness_level':
				console.log('setEZhudSettings(): brightness_level');
				setBrightnessLevel(value);
				break;
			case 'wifi_mode':
				console.log('setEZhudSettings(): wifi_mode');
				setWifiMode(value);
				rebootNeeded = true;
				break;
			case 'wifi_country':
				console.log('setEZhudSettings(): wifi_country');
				setWifiCountry(value);
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

	return getEZhudSettings();

}

function getBrightnessMode() {

	console.log('	Stub getBrightnessMode()');
	return 'day';

}

function setBrightnessMode(mode) {

	console.log('	setBrightnessMode()');

	// Check we got a valid mode
	if( mode != 'day' && mode != 'night' ) {
		console.log(`	setBrightnessMode(): Unexected mode: ${mode}`);
		return 1;
	}

	try {
		console.log(`	setBightnessMode(): Setting brightness mode to ${mode}`);
		let res = execSync(`csmt state ${mode}`);
		return 0;
	} catch(err) {
		console.log('	setBrightnessMode(): err', err);
		console.log('	setBrightnessMode(): stderr', err.stderr.toString());
	}

	return 1;

}

function getBrightnessLevel() {

	console.log('	Stub getBrightnessLevel()');
	return 60;

}

function setBrightnessLevel(level) {

	console.log('	Stub setBrightnessLevel()');

}

function getWifiMode() {

	console.log('	getWifiMode()');
	var bashCmd = `grep -rnw ${CS_ENV_FILE} -e ENABLE_HOTSPOT`;
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

function setWifiMode(mode) {

	console.log('	setWifiMode()');

	if( mode != 'hotspot' && mode != 'client' ) {
		console.log(`	setWifiMode(): Unexpected wifi mode: ${mode}`);
		return 1;
	}

	// Wifi mode can be set through crankshaft_env.sh
	if( mode == 'hotspot' ) {
		// TODO: Should the previous client ssid and psk be saved?
		try {
			// Set hotspot mode
			let res = execSync(`sudo sed -i 's/ENABLE_HOTSPOT=./ENABLE_HOTSPOT=1/' ${CS_ENV_FILE}`);
			// Unset client ssid and psk
			res = execSync(`sudo sed -i 's/WIFI_SSID=*/WIFI_SSID="sample"/' ${CS_ENV_FILE}`);
			res = execSync(`sudo sed -i 's/WIFI_PSK=*/WIFI_PSK="sample"/' ${CS_ENV_FILE}`);
			res = execSync(`sudo sed -i 's/WIFI2_SSID=*/WIFI2_SSID="sample"/' ${CS_ENV_FILE}`);
			res = execSync(`sudo sed -i 's/WIFI2_PSK=*/WIFI2_PSK="sample"/' ${CS_ENV_FILE}`);
			// Force recreate wpa_supplicant.conf update
			res = execSync(`sudo sed -i 's/WIFI_UPDATE_CONFIG=*/WIFI_UPDATE_CONFIG=1/' ${CS_ENV_FILE}`);
			return 0;
		} catch(err) {
			console.log('	setWifiMode(): Failed to set hotspot mode');
			console.log('	setWifiMode(): err', err);
			console.log('	setWifiMode(): stderr', err.stderr.toString());
		}
	} else if( mode == 'client' ) {
		try {
			// Disable hotspot
			let res = execSync(`sudo sed -i 's/ENABLE_HOTSPOT=./ENABLE_HOTSPOT=0/' ${CS_ENV_FILE}`);
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

function getWifiCountry() {

	console.log('	getWifiCountry()');
	var bashCmd = '';
	var wifiCountry = 'Error';

	if( getWifiMode() == 'hotspot' ) {
		bashCmd = `grep -rnw ${HOSTAPD_CONF} -e country_code`;
	} else {
		bashCmd = `grep -rnw ${CS_ENV_FILE} -e WIFI_COUNTRY`;
	}

	console.log(`	getWifiCountry(): bashCmd=${bashCmd}`);

	try {
		let res = execSync(bashCmd);
		console.log(`	getWifiCountry(): res.toString()=${res.toString()}`);
		wifiCountry = res.toString().replace(/["\n]+/g, '').split('=')[1];
		console.log(`	getWifiCountry(): wifiCountry=${wifiCountry}`);
	} catch(err) {
		console.log('	getWifiCountry(): err', err);
		console.log('	getWifiCountry(): stderr', err.stderr.toString());
	}

	return wifiCountry;

}

function setWifiCountry(country) {

	console.log('	Stub setWifiCountry()');

}

function getWifiSSID() {

	console.log('	getWifiSSID()');
	var bashCmd = '';
	var wifiSSID = 'Error';

	if( getWifiMode() == 'hotspot' ) {
		bashCmd = `grep -rnw ${HOSTAPD_CONF} -e ssid`;
	} else {
		bashCmd = `grep -rnw ${CS_ENV_FILE} -e WIFI_SSID`;
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

function setWifiSSID(ssid) {

	console.log('	Stub setWifiSSID()');

}

function getWifiPSK() {

	console.log('	Stub getWifiPSK()');
	return 'EZhud'

}

function setWifiPSK(psk) {

	console.log('	Stub setWifiPSK()');

}

module.exports = {
	getEZhudSettings,
	setEZhudSettings
}
