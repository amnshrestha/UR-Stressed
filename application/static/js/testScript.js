$(document).ready(function(){
    let namespace = "/test";
    let video = document.querySelector("#videoElement");
  
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
  
    socket.on('connect', function() {
      console.log('Connected!');
    });
  
    var constraints = {
      video: {
        width: { min: 800 },
        height: { min: 600 }
      }
    };
  
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
      console.log("Inside if");
      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("Inside function");
        video.srcObject = stream;
        video.play()
      }).catch(function(error) {
        console.log(error);
      });
    }
    
  });