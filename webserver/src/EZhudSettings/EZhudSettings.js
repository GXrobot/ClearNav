const fs = require('fs');

// Gets all system settings supported by the mobile application in JSON format
function getEZhudSettings() {

	console.log('getEZhudSettings() called');
	
	// TBD: Actually get settings...

	var currentSettings = {
		'brightness_mode': 'day',
		'brightness_level': 60,
		'wifi_country': 'CA',
		'wifi_mode': 'hotspot',
		'wifi_ssid': 'test_wifi_ssid',
		'wifi_psk': 'test_wifi_psk'
	};

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

module.exports = {
	getEZhudSettings,
	setEZhudSettings
}

