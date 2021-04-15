const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

// Written by Aman
// Finds x,y coordinate of a landmark
function findCoordinates(toEnumerate, idToFind) {
  var width = canvasElement.width;
  var height = canvasElement.height;
  var cx = parseInt(toEnumerate[idToFind].x * width);
  var cy = parseInt(toEnumerate[idToFind].y * height);
  return [cx, cy];
}

class HandRaised {
  constructor() {
    this.skipFrame = 10;
    this.frameCounter = 0;
    this.minY = 0;
  }

  checkForPalm(hand) {
    return findCoordinates(hand, 12)[1] < this.minY;
  }

  getMinFaceY(face) {
    let min = Number.MAX_SAFE_INTEGER;
    Object.keys(face).forEach(key => {
      if (findCoordinates(face, key)[1] < min) {
        min = findCoordinates(face, key)[1];
      }
    })
    return min;
  }

  checkForHand(leftHand, rightHand, face) {
    if (this.frameCounter % this.skipFrame === 0) {
      this.minY = this.getMinFaceY(face);
      let palm = false;
      if (leftHand !== undefined) {
        if (this.checkForPalm(leftHand)) { palm = true; }
      }
      if (rightHand !== undefined) {
        if (this.checkForPalm(rightHand)) { palm = true; }
      }
      
      if (palm) { console.log('You raised your hand'); } // eslint-disable-line}
    }
    
    this.frameCounter++;
  }

}

const hr = new HandRaised();

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

  if (typeof results.leftHandLandmarks !== 'undefined' || typeof results.rightHandLandmarks !== 'undefined') {
    hr.checkForHand(results.leftHandLandmarks, results.rightHandLandmarks, results.faceLandmarks);
  }
  canvasCtx.restore();
}

const holistic = new Holistic({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
  }
});

holistic.setOptions({
  upperBodyOnly: false,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
holistic.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({
      image: videoElement
    });
  },
  width: 1280,
  height: 720
});
camera.start();
