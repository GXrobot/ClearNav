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

var addr = "";

// listen for google maps event on search bar
google.maps.event.addDomListener(window, 'load', function() {
    var input = document.getElementById('searchTextField');

    // Get the place details from the autocomplete object.
    autocomplete = new google.maps.places.Autocomplete(input);

    // only results from canada...
    // can change later
    autocomplete.setComponentRestrictions({
        country: ["ca"],
    });

    // when you press on an autocompleted location
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var place = autocomplete.getPlace();
        var address = place.formatted_address;
        addr = address;

        var log = "Autocompleted address: " + address;
        console.log("log: ", log);
        // var latitude = place.geometry.location.lat();
        // var longitude = place.geometry.location.lng();
    });
});

// executed when the "Start" button on the navigation page is pressed
function StartNavigation_Prod() {
    // open google maps app
    var mode = "&mode=d";

    // form "turn-by-turn navigation" intent
    // q: sets the end point for the navigation search (the address)
    // mode: sets the method of transportation
    var destination = "google.navigation:q=" + addr + mode;
	console.log("starting navigation to", addr);

    // open google maps with navigation started
    window.open(destination,"_blank");
}

function StartNavigation_Dev() {
    const loc = document.getElementById("searchTextField_dev").value;

    // open google maps app
    var mode = "&mode=d";

    // form "turn-by-turn navigation" intent
    // q: sets the end point for the navigation search (the address)
    // mode: sets the method of transportation
    var destination = "google.navigation:q=" + loc + mode;
	console.log("starting navigation to", loc);

    // open google maps with navigation started
    window.open(destination,"_blank");
}
