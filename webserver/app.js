const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const {exec} = require('child_process');

const setHeaders = require('./src/middlewares/setHeaders');
const updateRouter = require('./src/routes/update');
const assetsRouter = require('./src/routes/assets');
const pagesRouter = require('./src/routes/pages');

// Define the server
const app = express();
const port = 80;

app.use(setHeaders);
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set("port", port);

// Serve requests for assets
app.use('/assets', assetsRouter);

// Handle requests related to settings
app.use('/update', updateRouter);

// All other requests are either asking for pages (e.g.: index.html) or should return an error
app.use('/*', pagesRouter);

// Start the server
const server = http.createServer(app);
server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);

// 	// Adjust the address requests are sent to in index.js
// 	console.log('Looking for host IP address');
// 	exec('hostname --all-ip-addresses', (err, stdout, stderr) => {

// 		if( err ) {
// 			console.log('Failed to find host IP address:', err);
// 		} else {
// 			// Some situations give multiple IP addresses, the first one is the one we want
// 			let ipaddr = stdout.split(' ')[0];
// 			console.log(`Setting baseURL in index.js to 'http://${ipaddr}:8080'`);
// 			exec(`sed -i  --expression 's@var baseUrl = "http://.*:8080";@var baseUrl = "http://${ipaddr}:8080";@' /home/pi/ClearNav/webserver/src/pages/index.js`, (err, stdout, stderr) => {
// 				if( err ) {
// 					console.log('Failed to set baseURL:', err);
// 				} else {
// 					console.log(`Successfully set baseURL to ${ipaddr}`);
// 				}
// 			});
// 		}
// 	});
});

