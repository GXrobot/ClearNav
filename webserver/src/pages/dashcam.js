var baseUrl = "localhost:80";

filelist = ["2022-08-01_23-24-12.mp4", "2022-08-02_23-24-12.mp4", "2022-08-03_23-24-12.mp4", "2022-08-01_23-14-12.mp4"];
// filelist = ["2022-08-01_23-24-12.mp4"];
container_count = 1;
daylist = [];

// populate page with videos
for (var day = 31; day >= 1; day--) {         // loop over days
    arr = [];
    for (var j = 0; j < filelist.length; j++) {     // loop over file list
        var a = "2022-08-0" + day;
        var b = "2022-08-" + day;
        if (filelist[j].includes(a) || filelist[j].includes(b)) {
            arr.push(filelist[j]);
        }
    }

    // there exists video files on this day
    if (arr.length != 0) {
        daylist.push(arr);
        // console.log(daylist);

        // create header
        document.getElementById("header" + container_count).innerHTML = "August " + day + ", 2022";

        // show 3 recent days for which files exist
        if (container_count > 3) { break; }
        var container_div = "video-container" + container_count;

        // add buttons to new video-container div
        for (var x = 1; x < arr.length + 1; x++) {

            // var newDiv = document.createElement('div');
            // newDiv.classList.add('card');
            // newDiv.appendChild(document.createTextNode(x))
            // document.getElementById(container_div).appendChild(newDiv);

            var newButton = document.createElement('input');
            newButton.type = "button";
            newButton.classList.add('card');
            newButton.setAttribute('id', arr[x-1]);
            newButton.addEventListener('click', somefunction);
            document.getElementById(container_div).appendChild(newButton);
        }
        container_count = container_count + 1;
    }
}

function somefunction(event) {
    return getVideoFile(event.target.id);
}

// This function queries the server for updated settings
// Expects the settings and their values to be returned as a JSON
function getUpdatedVideoFiles() {
    console.log('Called getUpdatedVideoFiles()');

	// Create the http request object
	var xhttp = new XMLHttpRequest();

	// Set up the request
	xhttp.open('GET', baseUrl + '/update/videoList', true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	// Define the callback for when we get a response
	xhttp.onreadystatechange = function() {
		// Check that the response status code indicates success
		if( this.readyState == 4 && this.status == 200 ) {
			// Do something useful with the data...
			console.log(this.responseText);
		} };
	// Send the request
	console.log("Sending GET update");
	xhttp.send();
}

function getVideoFile(file) {
    console.log("Called getVideoFile(): " + file);

	// // Create the http request object
	// var xhttp = new XMLHttpRequest();

	// // Set up the request
	// xhttp.open('GET', baseUrl + '/update/videoList', true);
	// xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	// // Define the callback for when we get a response
	// xhttp.onreadystatechange = function() {
	// 	// Check that the response status code indicates success
	// 	if( this.readyState == 4 && this.status == 200 ) {
	// 		// Do something useful with the data...
	// 		console.log(this.responseText);
	// 	} };
	// // Send the request
	// console.log("Sending GET update");
	// xhttp.send();
}