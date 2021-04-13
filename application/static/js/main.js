const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
                     {color: '#C0C0C070', lineWidth: 1});
 


      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});


         
    var left_End_of_Lip = findCoordinates(landmarks, 76);
    canvasCtx.fillStyle = "#FF0000";
    canvasCtx.fillRect(left_End_of_Lip[0], left_End_of_Lip[1], 5, 5);

    var right_End_of_Lip = findCoordinates(landmarks, 291);
    canvasCtx.fillStyle = "#FF0000";
    canvasCtx.fillRect(right_End_of_Lip[0], right_End_of_Lip[1], 5, 5);
    }
  }
  canvasCtx.restore();
}

// def findCoordinates(toEnumerate, image, idToFind):
//     for id,lm in enumerate(toEnumerate):
//         h,w,c = image.shape
//         cx, cy = int(lm.x * w), int(lm.y * h)
//         if(id == idToFind):
//             return cx, cy
    
//     return -1,-1

function findCoordinates(toEnumerate, idToFind){
    var width = canvasElement.width;
    var height = canvasElement.height;
    var cx = parseInt(toEnumerate[idToFind].x * width);
    var cy = parseInt(toEnumerate[idToFind].y * height);
    return [cx, cy];
}

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({image: videoElement});
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

