const express = require('express');
const path = require('path');
const url = require('url');
const router = express.Router();

const EZhudSettings = require('../EZhudSettings/EZhudSettings');

// Handle GET request. Should only receive GET requests for settings.json
router.get('/*', (req, res, next) => {

	console.log(`Handling ${req.method} request in Updates Router`);

	// Clean up the pathing
	var cleanPath = url.parse(req.url).pathname;
	console.log(`cleanPath=${cleanPath}`);

	// Check if the request is for settings.json
	if( cleanPath == '/settings.json' ) {
		// Return the current settings
		console.log('Sending back settings.json');
		res.send(EZhudSettings.getEZhudSettings());
	} else {
		// We aren't supposed to get any GET request for anything other than settings.json
		// Return an error code in this case
		console.log(`Received an invalid ${req.method} request for '${req.hostname}${req.originalUrl}' from ${req.ip}`);
		res.sendStatus(418);
	}

});

// Handle POST requests.Should only receive POST requests for config/?<key1>=<value1>&<key2>=<value2><...>
router.post('/*', (req, res, next) => {

	console.log(`Handling a ${req.method} request in Updates Router`);

	// Clean up the pathing
	var cleanPath = url.parse(req.url).pathname;
	console.log(`cleanPath=${cleanPath}`);

	// Check if the request is for config
	if( cleanPath == '/config' ) {
		// Update settings given, and then return the new state
		res.send(EZhudSettings.setEZhudSettings(req.body));
	} else {
		// We aren't suppoed to get any POST request for anything other than config
		// Return an error code in this case
		console.log(`Received an invalid ${req.method} request for '${req.hostname}${req.originalUrl}' from ${req.ip}`);
		res.sendStatus(418);
	}

});

// Need to export router, app.get() does not accept middlewares
module.exports = router;

