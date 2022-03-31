const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const setHeaders = require('./src/middlewares/setHeaders');
const updateRouter = require('./src/routes/update');
const assetsRouter = require('./src/routes/assets');
const pagesRouter = require('./src/routes/pages');

// Define the server
const app = express();
const port = 8080;

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
});

