var parsedJSON = null;
var chosenTree = "";
var park = 'SLA';

//Handlebar helper classes
Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase().replace(/\s/g, '');
});

Handlebars.registerHelper('retrieve', function(num) {
  $.getJSON ('./data/parks.json', function (json) {
      return json.parks[num];
    });
});

var app = {  
  
  showAlert: function (message, title) {  
    if (navigator.notification) {  
     navigator.notification.alert(message, null, title, 'OK');  
   } else {  
     alert(title ? (title + ": " + message) : message);  
   }  
  },

  renderSplashView: function() {  

    //alert('after placeholder');
    
    $.getJSON ('./data/data.json', function (json) {
      
      // alert('gotthisjson');

      //takes allparks-template as the source template
      var src = $('#allparks-template').html();
      
      //compiles it to make it a template
      template = Handlebars.compile(src);

      //for use later
      parsedJSON = json;

      //puts the json data (parks data) into the template
      data = template(json);

      //'unloads' all this stuff into the <body> tag
      html = $('body').html(data);
      
      $.mobile.changePage('#splash', {
          
      });
    })    
    
  },   

  initialize: function() {  
    console.log('BeforeInitialize'); // instead of alert()
    var self = this;  
    this.renderSplashView();
  }  
};
// app.initialize();
// end of app

$(document).on("mobileinit",function() {
    $.mobile.autoInitializePage = false;
}); 

// Handle the menu button
//
function onMenuKeyDown() {
  $.mobile.changePage('#setting', {
          
  });
}

// device APIs are available, however, needs to be placed further behind to allow API to run first
//
function onDeviceReady() {
  app.initialize();
  document.addEventListener("menubutton", onMenuKeyDown, false);
  playAudio(getAbsolutePath('audio/bird.mp3'));
  
  $(document).on("pagechange", function () {
    console.log("pagechange");
    stopAudio();
    stopNavigation();
    stopLocBased();
  });  
}

// Add onDeviceReady
//
document.addEventListener("deviceready", onDeviceReady, false);

function compareTree(a, b){
  var floata = parseFloat(a.dist);
  var floatb = parseFloat(b.dist);

  if(floata < floatb){
    return -1;
  }

  if(floata > floatb){
    return 1;
  }

  return 0;
}

// periodically displays the location info and search results based on current location
//
function searchNearbyTree(position){
  /*var info =    'Latitude: '           + position.coords.latitude              + '<br />' +
                'Longitude: '          + position.coords.longitude             + '<br />' +
                'Altitude: '           + position.coords.altitude              + '<br />' +
                'Accuracy: '           + position.coords.accuracy              + '<br />' +
                'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
                'Heading: '            + position.coords.heading               + '<br />' +
                'Speed: '              + position.coords.speed                 + '<br />' +
                'Timestamp: '          + position.timestamp                    + '<br />';
  */
  console.log(parsedJSON);
  var userPos = new LatLon(position.coords.latitude, position.coords.longitude);
  var result = "";
  var allResults = [];
  $('#locbasedresult').empty();
  for (var i = parsedJSON.trees.length - 1; i >= 0; i--) {
    var point = new LatLon(parsedJSON.trees[i].latitude, parsedJSON.trees[i].longitude);
    var distKM = userPos.distanceTo(point);   // in km
    var distMILES = (distKM/1.60934);         // in miles
    console.log("distMILES: "+distMILES);

    //Changed to 0.5 for testing
    if(distMILES <= 0.2){ // only keep nearby results
      console.log(parsedJSON.trees[i].name + " is nearby");
      
      var treeobj = {};
      treeobj.name = parsedJSON.trees[i].name;
      treeobj.dist = distMILES.toFixed(3);
      treeobj.audioURL = parsedJSON.trees[i].audioURL;

      allResults.push(treeobj);

      // var tmp = parsedJSON.trees[i].name.toLowerCase().replace(/\s/g, '');
      // result += "<li><a href='#"
      //   + tmp
      //   + "' onclick=\"setChosenTree('"
      //   + parsedJSON.trees[i].name
      //   + "');\">" 
      //   + distMILES.toFixed(3) 
      //   + " miles" 
      //   + " - " 
      //   + parsedJSON.trees[i].name 
      //   + "</a></li>";
      console.log(treeobj);
    }
  }

  allResults.sort(compareTree);

  for(var i = 0; i < allResults.length; i++){
    var tmp = allResults[i].name.toLowerCase().replace(/\s/g, '');
    result += "<li><a href='#"
        + tmp
        + "' onclick=\"setChosenTree('"
        + allResults[i].name
        + "');\">" 
        + allResults[i].dist 
        + " miles" 
        + " - " 
        + allResults[i].name 
        + "</a></li>";
  }

  if(result.length == 0){
    result = "No trees within 0.2 miles! <br/> Are you in Schenley Park?"
  }

  console.log(allResults);

  $("#locbasedresult").append(result);
  $("#locbasedresult").listview("refresh");
}

// find directions from lat1,lng1 to lat2,lng2
//
function findDirection(lat1,lng1,lat2,lng2){
  console.log("findDirection");

  var map = null;
  map = new GMaps({
    el: '#routeMap',
    lat: lat1,
    lng: lng1
  });

  map.travelRoute({
    origin: [lat1, lng1],
    destination: [lat2, lng2],
    travelMode: 'walking',
    step: function(e){
      $('#instructions').append('<li>'+e.instructions+'</li>');
      $('#instructions li:eq('+e.step_number+')').delay(450*e.step_number).fadeIn(100, function(){
        map.drawPolyline({
          path: e.path,
          strokeColor: '#131540',
          strokeOpacity: 0.6,
          strokeWeight: 6
        });  
      });
      $("#instructions").listview("refresh");
    }
  });
  console.log("End of findDirection");
}

// argument: tree name
// returns a tree object in the JSON
function findTreeByName(treename){
  var coords = null;
  for (var i = parsedJSON.trees.length - 1; i >= 0; i--) {
    if(treename == parsedJSON.trees[i].name){
      console.log("found: "+treename);
      coords = new Array(parsedJSON.trees[i].latitude, parsedJSON.trees[i].longitude);
      console.log("coords"+coords);
    }
  };
  return coords;
}

function setChosenTree(treename){
  chosenTree = treename;
  console.log("chosenTree: " +chosenTree);
}



function goToNext(){
   var url = "#treehome";
   $.mobile.changePage(url, {
          
    });
}

function goBackToPark() {
    //alert(park);
    var url = "#"+park;
    $.mobile.changePage(url, {
      dataUrl: url
    });
    //console.log(window.history);
}

function setPark(parkName){
  park = parkName;
  //console.log(window.history);
  // alert(parkName);

}