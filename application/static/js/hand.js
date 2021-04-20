// const videoElement = document.getElementsByClassName('input_video')[0];
// const canvasElement = document.getElementsByClassName('output_canvas')[0];
// const canvasCtx = canvasElement.getContext('2d');

// // Written by Aman
// // Finds x,y coordinate of a landmark
// function findCoordinates(toEnumerate, idToFind) {
//   var width = canvasElement.width;
//   var height = canvasElement.height;
//   var cx = parseInt(toEnumerate[idToFind].x * width);
//   var cy = parseInt(toEnumerate[idToFind].y * height);
//   return [cx, cy];
// }

// class HandRaised {
//   constructor() {
//     this.skipFrame = 10;
//     this.frameCounterHandRaise = 0;
//     this.frameCounterThumbsUp = 0;
//     this.minY = 0;
//     this.thumbsLengthFactor = 1.2;
//     this.thumbsCloseFactor = 1.02;
//     this.thumbsUp = false;
//   }

//   checkForPalm(hand) {
//     return findCoordinates(hand, 12)[1] < this.minY;
//   }

//   getMinFaceY(face) {
//     let min = Number.MAX_SAFE_INTEGER;
//     Object.keys(face).forEach(key => {
//       if (findCoordinates(face, key)[1] < min) {
//         min = findCoordinates(face, key)[1];
//       }
//     })
//     return min;
//   }

//   checkForHand(leftHand, rightHand, face) {
//     if (this.frameCounterHandRaise % this.skipFrame === 0) {
//       this.minY = this.getMinFaceY(face);
//       let palm = false;
//       if (leftHand !== undefined) {
//         if (this.checkForPalm(leftHand)) { palm = true; }
//       }
//       if (rightHand !== undefined) {
//         if (this.checkForPalm(rightHand)) { palm = true; }
//       }
      
//       if (palm) { console.log('You raised your hand'); } // eslint-disable-line}
//     }
//     this.frameCounterHandRaise++;
//     if (this.frameCounterHandRaise >= 10000){
//       this.frameCounterHandRaise = 0;
//     }
//   }

//   checkforThumbsUp(leftHand, rightHand) {
//     if (this.frameCounterThumbsUp % this.skipFrame === 0) {
//       let rightHandThumbsUp = this.checkforOneHandThumbsUp(rightHand);
//       // let leftHandThumbsUp = this.checkforOneHandThumbsUp(leftHand);
//       if (rightHandThumbsUp) {
//         console.log("Thumbs up");
//         this.thumbsUp = true;
//         // socket.emit('thumbsup', "my right hand thumbs up");
//       }
//       // if (rightHandThumbsUp || leftHandThumbsUp) {
//       //   this.thumbsUp = true;
//       //   console.log("Thumbs up");
//       // }
//     }
//     this.frameCounterThumbsUp++;
//     if (this.frameCounterThumbsUp >= 10000){
//       this.frameCounterThumbsUp = 0;
//     }
//   }

//   checkforOneHandThumbsUp(targetHand) {
    
//     //finger tip coordinates
//     let y_rightThumbTip = findCoordinates(targetHand, 4)[1];
//     let x_rightIndexTip = findCoordinates(targetHand, 8)[0];
//     let x_rightMiddleTip = findCoordinates(targetHand, 12)[0];
//     let x_rightRingTip = findCoordinates(targetHand, 16)[0];
//     let x_rightPinkyTip = findCoordinates(targetHand, 20)[0];

//     //finger MCP coordinates
//     let y_rightIndexMCP = findCoordinates(targetHand, 5)[1];
//     let y_rightMiddleMCP = findCoordinates(targetHand, 9)[1];
//     let y_rightRingMCP = findCoordinates(targetHand, 13)[1];
//     let y_rightPinkyMCP = findCoordinates(targetHand, 17)[1];

//     //finger PIP coordinates
//     let x_rightIndexPIP = findCoordinates(targetHand, 6)[0];
//     let x_rightMiddlePIP = findCoordinates(targetHand, 10)[0];
//     let x_rightRingPIP = findCoordinates(targetHand, 14)[0];
//     let x_rightPinkyPIP = findCoordinates(targetHand, 19)[0];
  
//     let y_thumbsUp = false;
//     if (y_rightThumbTip * this.thumbsLengthFactor < y_rightIndexMCP && 
//       y_rightIndexMCP < y_rightMiddleMCP && 
//       y_rightMiddleMCP  < y_rightRingMCP && 
//       y_rightRingMCP < y_rightPinkyMCP) {
//         // console.log("thumb higher");
//         y_thumbsUp = true;
//     }
//     let x_thumbsUp = false;
//     if (x_rightIndexTip * this.thumbsCloseFactor < x_rightIndexPIP &&
//       x_rightMiddleTip * this.thumbsCloseFactor < x_rightMiddlePIP &&
//       x_rightRingTip * this.thumbsCloseFactor < x_rightRingPIP &&
//       x_rightPinkyTip * this.thumbsCloseFactor < x_rightPinkyPIP) 
//     {
//       // console.log("hand close");
//       x_thumbsUp = true;
//     }

//     if (y_thumbsUp && x_thumbsUp) {
//       // console.log("One hand Thumbs up");
//       return true;
//     }
//     return false;
    
//   }

// }

// const hr = new HandRaised();

// function onResults(results) {
//   canvasCtx.save();
//   canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//   canvasCtx.drawImage(
//       results.image, 0, 0, canvasElement.width, canvasElement.height);
//   drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
//                  {color: '#00FF00', lineWidth: 4});
//   drawLandmarks(canvasCtx, results.poseLandmarks,
//                 {color: '#FF0000', lineWidth: 2});
//   drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
//                  {color: '#C0C0C070', lineWidth: 1});
//   drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
//                  {color: '#CC0000', lineWidth: 5});
//   drawLandmarks(canvasCtx, results.leftHandLandmarks,
//                 {color: '#00FF00', lineWidth: 2});
//   drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
//                  {color: '#00CC00', lineWidth: 5});
//   drawLandmarks(canvasCtx, results.rightHandLandmarks,
//                 {color: '#FF0000', lineWidth: 2});

//   if (typeof results.leftHandLandmarks !== 'undefined' || typeof results.rightHandLandmarks !== 'undefined') {
//     // hr.checkForHand(results.leftHandLandmarks, results.rightHandLandmarks, results.faceLandmarks);
//     hr.checkforThumbsUp(results.leftHandLandmarks, results.rightHandLandmarks)
//   }
//   canvasCtx.restore();
// }

// const holistic = new Holistic({
//   locateFile: (file) => {
//     return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
//   }
// });

// holistic.setOptions({
//   upperBodyOnly: false,
//   smoothLandmarks: true,
//   minDetectionConfidence: 0.5,
//   minTrackingConfidence: 0.5
// });
// holistic.onResults(onResults);

// const camera = new Camera(videoElement, {
//   onFrame: async () => {
//     await holistic.send({
//       image: videoElement
//     });
//   },
//   width: 1280,
//   height: 720
// });
// camera.start();
