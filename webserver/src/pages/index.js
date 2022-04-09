// Example/debugging code for server backend communication

const debug = false;

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
		} };
	// Send the request
	console.log("Sending GET update");
	xhttp.send();
}

// This function sends updated settings to the server
// Expects the settings and their values to be returned as a JSON
function sendEZhudSettings() {
    // var country_select = document.getElementById('country-names');
    var country = document.querySelector(`[id=country-names]`);
    var wifi_mode = document.querySelector(`[id=mode-names]`);
    var brightness_mode = document.querySelector(`[id=bright-names]`);
    var brightness_level = document.getElementById('range');
    var wifi_ssid = document.getElementById('wifi-ssid');
    var wifi_psk = document.getElementById('wifi-psk');

    // incomplete settings by user
    if (country.value === "Choose..." || wifi_mode.value === "Choose..." || brightness_mode.value === "Choose..." ||
        wifi_ssid.value === "" || wifi_psk.value === "") {
        alert("Incomplete Settings. Please try again");
        return;
    }

	// Create the key value pairs of settings
	// var updatedSettings = "testkey1=testvalue1&testkey2=testvalue2";
	var updatedSettings = "wifi_mode=" + wifi_mode.value + 
                          "&wifi_country=" + country.value + 
                          "&brightness_mode=" + brightness_mode.value + 
                          "&brightness_level=" + brightness_level.value + 
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

        // objects for google maps route
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();

        // map instance
        const sfu = new google.maps.LatLng(49.2781, -122.9199);
        let map = new google.maps.Map(document.getElementById('map'), {
            // map options
            disableDefaultUI: true,
            center: sfu,
            zoom: 12,
        });

        directionsRenderer.setMap(map);

        // infowindow on marker
        const infowindow = new google.maps.InfoWindow();
        const infowindowContent = document.getElementById("infowindow-content");
        infowindow.setContent(infowindowContent);

        // autocomplete instance in search bar
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.setComponentRestrictions({
            country: ["ca"],
        });

        // marker instance 
        // const marker = new google.maps.Marker({
        //     map,
        //     anchorPoint: new google.maps.Point(0, -29),
        // });

        // listener for when we click on autocompleted address
        autocomplete.addListener("place_changed", () => {
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

            // infowindow.close();
            // marker.setVisible(false);

            // pull up the new marker
            // const place = autocomplete.getPlace();
            // marker.setPosition(place.geometry.location);
            // marker.setVisible(true);
            // infowindowContent.children["place-name"].textContent = place.name;
            // infowindowContent.children["place-address"].textContent = place.formatted_address;
            // infowindow.open(map, marker);
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
