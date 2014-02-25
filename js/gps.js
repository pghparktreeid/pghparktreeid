var locBasedWatchID = null;
var locBasedElement = null;

var navigateWatchID = null;
var navigateElement = null;

var treeObj = [];

// device APIs are available
//
function startLocBased() {
  if(locBasedWatchID == null){
    // Update every 5 seconds, enable high accuracy
    //
    var options = { frequency: 10000, maximumAge: 30000, timeout: 10000, enableHighAccuracy: true };
    locBasedElement = document.getElementById('geolocation');
    locBasedElement.innerHTML = "Loading...";
    //navigator.geolocation.getCurrentPosition(onGPSSuccess, onGPSError);
    locBasedWatchID = navigator.geolocation.watchPosition(onLocBasedGPSSuccess, onLocBasedGPSError, options);
    console.log("watch locBasedWatchID: "+ locBasedWatchID);
  }
  
}

// onLocBasedGPSSuccess Geolocation
//
function onLocBasedGPSSuccess(position) {
  var info =    'Latitude: '           + position.coords.latitude              + '<br />' +
                'Longitude: '          + position.coords.longitude             + '<br />' +
                'Altitude: '           + position.coords.altitude              + '<br />' +
                'Accuracy: '           + position.coords.accuracy              + '<br />' +
                'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
                //'Heading: '            + position.coords.heading               + '<br />' +
                //'Speed: '              + position.coords.speed                 + '<br />' +
                'Timestamp: '          + position.timestamp                    + '<br />';
  locBasedElement.innerHTML = "";
  //console.log(info);
  searchNearbyTree(position);
}

// onLocBasedGPSError Callback receives a PositionError object
//
function onLocBasedGPSError(error) {
  console.log('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
  if(locBasedWatchID != null){
    console.log("clear locBasedWatchID: "+ locBasedWatchID);
    navigator.geolocation.clearWatch(locBasedWatchID);
    locBasedWatchID = null;
  }
  locBasedElement.innerHTML = "Error retrieving GPS information. Please ensure that your device's GPS is working and try again.";
}

function stopLocBased(){
  if(locBasedWatchID != null){
    console.log("clear locBasedWatchID: "+ locBasedWatchID);
    navigator.geolocation.clearWatch(locBasedWatchID);
    locBasedWatchID = null;
  }
  if(locBasedElement != null){
    locBasedElement.innerHTML = "Stopped! <br/> Click \'START WALKING!\' to begin...";
  }
}

/* =============================== Navigation ============================ */

function startNavigation() {
  if(navigateWatchID == null){
    // Update every 5 seconds, enable high accuracy
    //
    var navoptions = { frequency: 10000, maximumAge: 30000, timeout: 10000, enableHighAccuracy: true };
    navigateElement = document.getElementById('navigateInfo');
    navigateWatchID = navigator.geolocation.watchPosition(onNavGPSSuccess, onNavGPSError, navoptions);
    //navigator.geolocation.getCurrentPosition(onGPSSuccess, onGPSError);
    console.log("watch navigateWatchID: "+ navigateWatchID);
  }

}

// onNavGPSSuccess Geolocation
//
function onNavGPSSuccess(position) {
  
  var info =    'Latitude: '           + position.coords.latitude              + '<br />' +
                'Longitude: '          + position.coords.longitude             + '<br />' +
                'Altitude: '           + position.coords.altitude              + '<br />' +
                'Accuracy: '           + position.coords.accuracy              + '<br />' +
                'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
                //'Heading: '            + position.coords.heading               + '<br />' +
                //'Speed: '              + position.coords.speed                 + '<br />' +
                'Timestamp: '          + position.timestamp                    + '<br />';
  //navigateElement.innerHTML = info;
  navigateElement.innerHTML = "";
  //console.log(info);

  
  treeObj = findTreeByName(chosenTree);
  
  var lat1 = parseFloat(position.coords.latitude);
  var lng1 = parseFloat(position.coords.longitude);
  
  console.log("treeObj: "+treeObj);
  var lat2 = treeObj[0];
  var lng2 = treeObj[1];
  console.log("lat1+lng1"+lat1+lng1);
  console.log("lat2+lng2"+lat2+lng2);
  findDirection(lat1, lng1, lat2, lng2);
}

// onNavGPSError Callback receives a PositionError object
//
function onNavGPSError(error) {
  console.log('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
  if(navigateWatchID != null){
    console.log("clear navigateWatchID: "+ navigateWatchID);
    navigator.geolocation.clearWatch(navigateWatchID);
    navigateWatchID = null;
  }
  if(navigateElement != null){
    navigateElement.innerHTML = "Error retrieving GPS information. Please ensure that your device's GPS is working and try again.";  
  }
  
}

function stopNavigation(){
  if(navigateWatchID != null){
    console.log("clear navigateWatchID: "+ navigateWatchID);
    navigator.geolocation.clearWatch(navigateWatchID);
    navigateWatchID = null;
  }
  if(navigateElement != null){
    navigateElement.innerHTML = "Stopped! <br/> Click \'Navigate!\' to begin...";
    document.getElementById('instructions').innerHTML = "";
  }
}