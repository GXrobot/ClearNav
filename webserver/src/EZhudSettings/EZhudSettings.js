const fs = require('fs');
const {execSync} = require('child_process');

// Gets all system settings supported by the mobile application in JSON format
function getEZhudSettings() {

	console.log('getEZhudSettings() called');

	// TBD: Actually get settings...

	var currentSettings = {
		'brightness_mode': getBrightnessMode(),
		'brightness_level': getBrightnessLevel(),
		'wifi_mode': getWifiMode(),
		'wifi_country': getWifiCountry(),
		'wifi_ssid': getWifiSSID(),
		'wifi_psk': getWifiPSK()
	};

	console.log(`getEZhudSettings(): Returning ${currentSettings}`);

	return JSON.stringify(currentSettings);

}

// Sets system settings given and returns the updated values in JSON format
// Expects the req.body from the POST request to be passed in unmodified
function setEZhudSettings(newSettings) {

	console.log('setEZhudSettings() called');

	console.log('Received the following settings:');

	// Iterate through each setting given
	// For loop because we only expect entries for settings that have changed
	for( const [key, value] of Object.entries(newSettings) ) {
		// TBD: Actually apply the settings...
		console.log(`	${key}: ${value}`);
	}

	return getEZhudSettings();

}

function getBrightnessMode() {

	console.log('Stub getBrightnessMode()');
	return 'day';

}

function setBrightnessMode(mode) {

	console.log('Stub setBrightnessMode()');

}

function getBrightnessLevel() {

	console.log('Stub getBrightnessLevel()');
	return 60;

}

function setBrightnessLevel(level) {

	console.log('Stub setBrightnessLevel()');

}

function getWifiMode() {

	console.log('getWifiMode()');
	var bashCmd = 'grep -rnw /boot/crankshaft/crankshaft_env.sh -e ENABLE_HOTSPOT';
	var wifiMode = 'Error';

	try {
		var res = execSync(bashCmd);
		console.log(`getWifiMode(): res.toString()=${res.toString()}`);
		let hotspotEnabled = (res.toString().split('='))[1];
		console.log(`getWifiMode(): hotspotEnabled=${hotspotEnabled}`);
		console.log(`getWifiMode(): hotspotEnabled==0 : ${hotspotEnabled==0}`);
		console.log(`getWifiMode(): hotspotEnabled=='0' : ${hotspotEnabled=='0'}`);
		console.log(`getWifiMode(): hotspotEnabled==1 : ${hotspotEnabled==1}`);
		console.log(`getWifiMode(): hotspotEnabled=='1' : ${hotspotEnabled=='1'}`);
		wifiMode = (hotspotEnabled == 1) ? 'hotspot' : 'client';
		console.log(`getWifiMode(): wifiMode=${wifiMode}`);
	} catch(err) {
		console.log('getWifiMode(): err', err);
		console.log('getWifiMode(): stderr', err.stderr.toString());
	}

	return wifiMode;

}

function setWifiMode(mode) {

	console.log('Stub setWifiMode()');

}

function getWifiCountry() {

	console.log('Stub getWifiCountry()');
	return 'CA';

}

function setWifiCountry(country) {

	console.log('Stub setWifiCountry()');

}

function getWifiSSID() {

	console.log('Stub getWifiSSID()');
	return 'ClearNav';

}

function setWifiSSID(ssid) {

	console.log('Stub setWifiSSID()');

}

function getWifiPSK() {

	console.log('Stub getWifiPSK()');
	return 'EZhud'

}

function setWifiPSK(psk) {

	console.log('Stub setWifiPSK()');

}

module.exports = {
	getEZhudSettings,
	setEZhudSettings
}
