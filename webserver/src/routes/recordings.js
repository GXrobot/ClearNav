const express = require('express');
const path = require('path');
const url = require('url');
const fs = require('fs');
const {execSync} = require('child_process');
const router = express.Router();

// Handle requests for various pages
router.get('/*', (req, res, next) => {

	var filePath = '';
	
	console.log(`\nHandling ${req.method} request for ${req.originalUrl} in Recordings Router`);

	// Check if the request is for a list of videos
	if( req.path == '/' ) {
		console.log('Sending list of videos');
		var videoList = [];

		try {
			// let res = execSync('find ../../recordings/*.mp4 -printf "%f\n"');
			// let res = execSync('find recordings/*.mp4 -print');
            let res = execSync('ls recordings/*.mp4');
            console.log("res: " + res);
			videoList = res.toString().split('\n');

		} catch(err) {
			console.log('Failed to get list of videos');
			console.log('err', err);
			console.log('stderr', err.stderr.toString());
		}

		res.send(JSON.stringify(videoList));
		return;
	}

	// Build the correct path to the video
	filePath = path.resolve(__dirname, '../..' + req.originalUrl);
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

