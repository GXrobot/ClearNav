const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const setHeaders = require('./src/middlewares/setHeaders');
const updateRouter = require('./src/routes/update');

// Define the server
const app = express();
const port = 8080;

app.use(setHeaders);
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set("port", port);

// Serve a default page when requesting the root of the server
app.get('/', (req, res) => {
	console.log('Serving the default page');
	var indexhtmlPath = path.resolve(__dirname, './src/pages/index.html');
	res.sendFile(indexhtmlPath);
});

// Serve index.js with index.html
app.get('/index.js', (req, res) => {
	console.log('Serving index.js');
	var indexjsPath = path.resolve(__dirname, './src/pages/index.js');
	res.sendFile(indexjsPath);
});

// Handle requests related to settings
app.use('/update', updateRouter);

// Return an error for all other requests
app.all('/*', (req, res) => {
	console.log(`Received an invalid ${req.method} request for '${req.hostname}${req.originalUrl}' from ${req.ip} in app.js`)
	res.sendStatus(418);
});

// Start the server
const server = http.createServer(app);

server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});

