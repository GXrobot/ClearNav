// Example/debugging code for server backend communication

const debug = true;

// var baseUrl = "http://169.254.1.2";
// var baseUrl = "http://10.0.0.18:8080";
var baseUrl = "localhost:80";

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
		} };
	// Send the request
	console.log("Sending GET update");
	xhttp.send();
}

// This function sends updated settings to the server
// Expects the settings and their values to be returned as a JSON
function sendEZhudSettings() {

    var country = document.querySelector(`[id=country-names]`);
    var wifi_mode = document.querySelector(`[id=mode-names]`);
    var wifi_ssid = document.getElementById('wifi-ssid');
    var wifi_psk = document.getElementById('wifi-psk');

    // incomplete settings by user
    if (country.value === "Choose..." || wifi_mode.value === "Choose..." || wifi_ssid.value === "" || wifi_psk.value === "") {
        alert("Incomplete Settings. Please try again");
        return;
    }

	// Create the key value pairs of settings
	// var updatedSettings = "testkey1=testvalue1&testkey2=testvalue2";
	var updatedSettings = "wifi_mode=" + wifi_mode.value + 
                          "&wifi_country=" + country.value + 
                          "&wifi_ssid=" + wifi_ssid.value + 
                          "&wifi_psk=" + wifi_psk.value;

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

// initialize the map widget
// After clicking autocompleted address, show marker on map
function initMap() {
    var input = document.getElementById('searchTextField');

    // production server has map stuff and address autocomplete
    if (!debug) {

        // objects for google maps marker, route, and info-window
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
        const sfu = new google.maps.LatLng(49.2781, -122.9199);
        const infowindow = new google.maps.InfoWindow();
        const infowindowContent = document.getElementById("infowindow-content");

        // map instance
        let map = new google.maps.Map(document.getElementById('map'), {
            // map options
            disableDefaultUI: true,
            center: sfu,
            zoom: 12,
        });

        directionsRenderer.setMap(map);

        // place a marker on current location
        infowindow.setContent(infowindowContent);
        const marker = new google.maps.Marker({
            map,
            anchorPoint: new google.maps.Point(0, -29),
            position: sfu
        });

        marker.setVisible(true);
        infowindowContent.children["place-name"].textContent = "Simon Fraser University";
        infowindowContent.children["place-address"].textContent = "8888 University Dr, Burnaby, BC V5A 1S6";
        infowindow.open(map, marker);

        // autocomplete instance in search bar
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.setComponentRestrictions({
            country: ["ca"],
        });

        // listener for when we click on autocompleted address
        autocomplete.addListener("place_changed", () => {

            // remove current location marker
            infowindow.close();
            marker.setVisible(false);

            const dest = autocomplete.getPlace();

            // build directions request
            directionsService.route({
                // hardcode current location to SFU
                origin: sfu,
                destination: {
                    query: dest.formatted_address
                    // document.getElementById("searchTextField").value,
                },
                travelMode: google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: false,
                unitSystem: google.maps.UnitSystem.METRIC
            })
            .then((response) => { directionsRenderer.setDirections(response); })
            .catch((e) => window.alert("Directions request failed due to " + status));


            // pull up the new marker
            // var log = "Autocompleted address: " + place.formatted_address;
            // console.log("log: ", log);
        });
    }
}

// inform user that navigation worked and is now on the EZHud device
function redirectUser() {
    document.getElementById("loader").style.display = "none";
    alert("Route sent to EZHud device");
}

function StartNavigation() {
    // spin the loader for 3 seconds
    document.getElementById("loader").style.display = "block";
    setTimeout(redirectUser, 3000);

    const loc = document.getElementById("searchBarAndButton").querySelector("#searchTextField").value;

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
