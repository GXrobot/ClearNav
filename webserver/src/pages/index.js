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
function sendEZhudSettings(updatedSettings) {

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

// executed when the "Start" button on the navigation page is pressed
function StartNavigation() {
    const loc = document.getElementById("nav_search_bar").value;

    // open google maps app
    // form query formatted string
    // var address = 8888;
    // var street = " University Dr";
    // var city = " Burnaby";
    // var prov = " BC";
    var mode = "&mode=d";


    // form "turn-by-turn navigation" intent
    // q: sets the end point for the navigation search (the address)
    // mode: sets the method of transportation
    // var destination = "google.navigation:q=" + address + street + city + prov + mode;

    var destination = "google.navigation:q=" + loc + mode;
	console.log("starting navigation to", loc);

    // open google maps with navigation started
    window.open(destination,"_blank");
}
