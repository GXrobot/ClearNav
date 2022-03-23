const express = require('express');
const path = require('path');
const url = require('url');
const fs = require('fs');
const router = express.Router();

// Handle requests for various pages
router.get('/*', (req, res, next) => {

	var filePath = '';
	
	console.log(`\nHandling ${req.method} request for ${req.originalUrl} in Pages Router`);

	// The main pages will be accessed with no pathing
	if( req.originalUrl == '/' ) {
		console.log(`Serving index.html to ${req.ip}`);
		filePath = path.resolve(__dirname, '../pages/index.html');
		res.sendFile(filePath);
		return;
	} else if( req.originalUrl == '/favicon.ico' ) {
		console.log('Ignoring request for favicon.ico');
		res.sendStatus(404);
		return;
	}
	
	// A specific file was requested. Build the correct path
	filePath = path.resolve(__dirname, '../pages' + req.originalUrl);
	console.log(`filePath=${filePath}`);

	// Check if the file exists
	fs.stat(filePath, function(err, stat) {
		if( err == null ) {
			console.log(`Serving ${filePath} to ${req.ip}`);
			res.sendFile(filePath);
			return;
		} else if( err.code === 'ENONENT' ) {
			console.log(`${filePath} does not exist`);
			res.sendStatus(404);
			return;
		} else {
			console.log(`Uknown error occured: ${err.code}`);
			res.sendStatus(418);
		}
	});

});

// Need to export router, app.get() does not accept middlewares
module.exports = router;

