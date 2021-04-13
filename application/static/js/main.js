const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                 {color: '#00FF00', lineWidth: 4});
  drawLandmarks(canvasCtx, results.poseLandmarks,
                {color: '#FF0000', lineWidth: 2});
  drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
                 {color: '#C0C0C070', lineWidth: 1});
  drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
                 {color: '#CC0000', lineWidth: 5});
  drawLandmarks(canvasCtx, results.leftHandLandmarks,
                {color: '#00FF00', lineWidth: 2});
  drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
                 {color: '#00CC00', lineWidth: 5});
  drawLandmarks(canvasCtx, results.rightHandLandmarks,
                {color: '#FF0000', lineWidth: 2});
  canvasCtx.restore();
}

const holistic = new Holistic({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
}});
holistic.setOptions({
  upperBodyOnly: false,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
holistic.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();




let namespace = "/test";
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
socket.on('connect', function() {
    console.log('Connected!');
});



// Written by Aman
// Finds x,y coordinate of a landmark
function findCoordinates(toEnumerate, idToFind){
  var width = canvasElement.width;
  var height = canvasElement.height;
  var cx = parseInt(toEnumerate[idToFind].x * width);
  var cy = parseInt(toEnumerate[idToFind].y * height);
  return [cx, cy];
}

class AllDetectors{

  constructor(){
    this.sd = new SmileDetector()//Smile Detector
    this.hr = new HandRaiseDetector()//Hand Raised
  }

}


class SmileDetector{

  constructor(){
    this.frameSkip = 5;// allow frame skip
    this.currentFrame = 0;// Current frame size
    this.previousLength = 0;

    //Landmark points of interest
    this.x_for_left_lip_corner = 0;
    this.y_for_left_lip_corner = 0;

    this.x_for_right_lip_corner = 0;
    this.y_for_right_lip_corner = 0;

    this.x_for_left_face_corner = 0;
    this.y_for_left_face_corner = 0;

    this.x_for_right_face_corner = 0;
    this.y_for_right_face_corner = 0;
  }

  mainDetect(){

  }

}


class HandRaised{
  constructor(){

  }

}