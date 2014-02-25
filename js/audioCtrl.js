  //helper to get the local filepath
  function getAbsolutePath(src) {
    var path = window.location.pathname;
    path = path.substr( path, path.length - 10 );
    return 'file://' + path + src;
  }

  // Audio player
  //
  var my_media = null;
  var mediaTimer = null;
  var isPlaying = false;

  //change only this var to toggle debug mode
  //
  var debugMode = false;

  // Play audio
  //
  function playAudio(src) {

    // Create Media object from src
    if(my_media == null){
      try{
        my_media = new Media(src, onMediaSuccess, onMediaError);  
      }
      catch(e){
        console.log("No media on this device to play: "+src);
        return false;
      }
      if(debugMode){
        console.log("src: "+src);
      }
    } 

      // Play audio
      my_media.play();
      isPlaying = true;

      // Update my_media position every second
      if (mediaTimer == null) {
        mediaTimer = setInterval(function() {
          // get my_media position
          my_media.getCurrentPosition(
            // success callback
            function(position) {
              if (position > -1) {
                setAudioPosition((position) + " sec");
              }
            },
            // error callback
            function(e) {
              console.log("Error getting pos=" + e);
              setAudioPosition("Error: " + e);
            }
          );
        }, 1000);
      }
  }

  // Pause audio
  //
  function pauseAudio() {
    if (my_media) {
      my_media.pause();
      isPlaying = false;
    }
    if(debugMode){
      console.log("audioPaused");
    }
  }

  // Stop audio
  //
  function stopAudio() {
    if (my_media) {
      my_media.stop();
      my_media.release();
      my_media = null;
      isPlaying = false;
    }
    clearInterval(mediaTimer);
    mediaTimer = null;
  }

  // onSuccess Callback
  //
  function onMediaSuccess() {
    if(my_media){
      my_media.release();
      my_media = null;
      isPlaying = false;
    }
    console.log("playAudio():Audio Success");
    if(debugMode){
      console.log("Success & released");
    }
  }

  // onError Callback
  //
  function onMediaError(error) {
    console.log('code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
    if (my_media) {
      my_media.release();
      my_media = null;
      isPlaying = false;
    }
  }

  // Set audio position, not shown in our Tree app
  //
  function setAudioPosition(position) {
    document.getElementById('audio_position').innerHTML = position;
  }

  function togglePlayPause(src){
    if(isPlaying){
      pauseAudio();
    }else{
      playAudio(src);
    }
  }