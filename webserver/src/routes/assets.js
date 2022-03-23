const express = require('express');
const path = require('path');
const url = require('url');
const fs = require('fs');
const router = express.Router();

// Handle requests for various asset files
router.get('/*', (req, res, next) => {
	
	console.log(`\nHandling ${req.method} request for ${req.originalUrl} in Assets Router`);

	// Build the correct path
	var filePath = path.resolve(__dirname, '../assets' + req.path);
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

