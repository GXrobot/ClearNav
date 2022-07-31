var baseUrl = "localhost";
// var baseUrl = "http://169.254.1.2";

// This function queries the server for updated settings
function getUpdatedVideoFiles() {
    console.log('Called getUpdatedVideoFiles()');

	// Create the http request object
	var xhttp = new XMLHttpRequest();

	// Set up the request
	// xhttp.open('GET', baseUrl + '/recordings', true);
	xhttp.open('GET', '/recordings', true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	// Define the callback for when we get a response
	xhttp.onreadystatechange = function() {
		// Check that the response status code indicates success
		if( this.readyState == 4 && this.status == 200 ) {
            // update the "Videos" page with the new videos
            updatePage(this.responseText);
		} 
    };

	// Send the request
	console.log("Sending GET update");
	xhttp.send();
}

// this function fetches a specific video file from server.
function getVideoFile(file) {
    console.log("Called getVideoFile(): " + file);

	// Create the http request object
	var xhttp = new XMLHttpRequest();

	// Set up the request
	xhttp.open('GET', '/recordings/' + file, true);
	xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	// Define the callback for when we get a response
	xhttp.onreadystatechange = function() {
		// Check that the response status code indicates success
		if( this.readyState == 4 && this.status == 200 ) {
			// console.log("response: " + this.responseText);
            
            // open url in new tab
            window.open('/recordings/' + file, '_blank').focus();
        } 
    };
	// Send the request
	console.log("Sending GET update");
	xhttp.send();
}

function fixshit(fl) {
    var temp = [];
    var str = "";
    var m = 0;

    // construct list
    for (var a = 0; a < fl.length; a++) {
        if (fl[a] === '"' || fl[a] === '[' || fl[a] === ']') {
            continue;
        }

        if (fl[a] == ",") {
            temp.push(str);
            str = [];
            m++;
            continue;
        }
        str += fl[a];
    }
    for (var a = 0; a < temp.length; a++) {
        temp[a] = temp[a].substring(11);
    }
    return temp;
}

// updates page with new list of videos
function updatePage(filelist) {

    container_count = 1;
    daylist = [];

    // object returned by server is one big string, not a list of filename strings
    filelist = fixshit(filelist)

    // clear videos before repopulating page
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.remove();
    });

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
}

function somefunction(event) {
    return getVideoFile(event.target.id);
}


