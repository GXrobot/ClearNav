// Example/debugging code for server backend communication

var baseUrl = "http://10.0.0.18:8080";

// https://www.w3schools.com/whatis/whatis_ajax.asp

// This function queries the server for updated settings
// Expects the settings and their values to be returned as a JSON
function getEZhudSettings() {

	// Create the http request object
	var xhttp = new XMLHttpRequest();

	// Set up the request
	xhttp.open('GET', baseUrl + '/update/settings.json', true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	// Define the callback for when we get a response
	xhttp.onreadystatechange = function() {
		// Check that the response status code indicates success
		if( this.readyState == 4 && this.status == 200 ) {
			// Convert the incoming data into JSON format
			retData = JSON.parse(this.responseText);
			// Do something useful with the data...
			console.log(retData);
		}
	};

	// Send the request
	console.log("Sending GET update");
	xhttp.send();

}

// This function sends updated settings to the server
// Expects the settings and their values to be returned as a JSON
function sendEZhudSettings() {

	// Create the key value paris of settings
	var updatedSettings = "testkey1=testvalue1&testkey2=testvalue2";

	// Create the http request object
	var xhttp = new XMLHttpRequest();

	// Set up the request
	xhttp.open('POST', baseUrl + '/update/config', true);
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	// Define the callback for when we get a response
	xhttp.onreadystatechange = function() {
		// Check that the response status code indicates success
		if( this.readyState == 4 && this.status == 200 ) {
			// Convert the incoming data into JSON format
			retData = JSON.parse(this.responseText);
			// Do something useful with the data...
			console.log(retData);
		}
	};

	// Send the request
	console.log("Sending POST update request:");
	console.log(updatedSettings);
	xhttp.send(updatedSettings)
}

