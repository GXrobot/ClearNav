const fs = require('fs');
const {execSync} = require('child_process');

const CS_ENV_FILE = '/boot/crankshaft/crankshaft_env.sh';
const HOSTAPD_CONF = '/etc/hostapd/hostapd.conf';

// System always boots in day mode
var brightnessMode = 'day';

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

	console.log('setEZhudSettings()');
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

	try {
		execSync('sync');
	} catch(err) {
		console.log('setEZhudSettings(): Failed to flush changes to disk');
		console.log('setEZhudSettings(): err', err);
		console.log('setEZhudSettings(): stderr', err.stderr.toString());
	}

	return getEZhudSettings();

}

function getBrightnessMode() {

	console.log('	getBrightnessMode()');
	return brightnessMode;

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
		brightnessMode = mode;
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

function getWifiCountry() {

	console.log('	getWifiCountry()');
	var bashCmd = '';
	var wifiCountry = 'Error';

	if( getWifiMode() == 'hotspot' ) {
		bashCmd = `grep ${HOSTAPD_CONF} -e country_code`;
	} else {
		bashCmd = `grep ${CS_ENV_FILE} -e WIFI_COUNTRY`;
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

	console.log('	setWifiCountry()');

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

function getWifiSSID() {

	console.log('	getWifiSSID()');
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

function setWifiSSID(ssid) {

	console.log('	setWifiSSID()');

	// https://stackoverflow.com/questions/4919889/is-there-a-standard-that-defines-what-is-a-valid-ssid-and-password
	// Any 0 to 32 length 'string' is allowed (technically octets but I don't think we can get non-ASCII characters from a POST query)
	if( ssid.length > 32 ) {
		console.log(`	setWifiSSID(): Invalid length SSID: ${ssid}:${ssid.length}`);
		return 1;
	}

	var bashCmd = '';

	if( getWifiMode() == 'hotspot' ) {
		console.log(`	setWifiSSID(): Setting hotspot Wifi SSID to ${ssid}`);			
		try {
			execSync(`sudo sed -i 's/ssid=.*/ssid=${ssid}/' ${HOSTAPD_CONF}`);
		} catch(err) {
			console.log('	setWifiSSID(): Failed to set hotspot country');
			console.log('	setWifiSSID(): err', err);
			console.log('	setWifiSSID(): stderr', err.stderr.toString());
			return 1;
		}
	} else {
		console.log(`	setWifiSSID(): Setting client Wifi SSID to ${ssid}`);			
		try {
			execSync(`sudo sed -i 's/WIFI_SSID=.*/WIFI_SSID=${ssid}/' ${CS_ENV_FILE}`);
			execSync(`sudo sed -i 's/WIFI_UPDATE_CONFIG=0/WIFI_UPDATE_CONFIG=1/' ${CS_ENV_FILE}`);
		} catch(err) {
			console.log('	setWifiSSID(): Failed to set client country');
			console.log('	setWifiSSID(): err', err);
			console.log('	setWifiSSID(): stderr', err.stderr.toString());
			return 1;
		}
	}

	return 0;

}

function getWifiPSK() {

	console.log('	getWifiPSK()');
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

function setWifiPSK(psk) {

	console.log('	setWifiPSK()');

	// Password validation?
	// https://w1.fi/cgit/hostap/plain/hostapd/hostapd.conf
	
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
			execSync(`sudo sed -i 's/WIFI_PSK=.*/WIFI_PSK=${psk}/' ${CS_ENV_FILE}`);
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
	setEZhudSettings
}
