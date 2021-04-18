const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');



function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

      // Commented the following to Remove unnecessary drawings

  // drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
  //                {color: '#00FF00', lineWidth: 4});
  // drawLandmarks(canvasCtx, results.poseLandmarks,
  //               {color: '#FF0000', lineWidth: 2});
  // drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
  //                {color: '#C0C0C070', lineWidth: 1});
  // drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
  //                {color: '#CC0000', lineWidth: 5});
  // drawLandmarks(canvasCtx, results.leftHandLandmarks,
  //               {color: '#00FF00', lineWidth: 2});
  // drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
  //                {color: '#00CC00', lineWidth: 5});
  // drawLandmarks(canvasCtx, results.rightHandLandmarks,
  //               {color: '#FF0000', lineWidth: 2});

  if(typeof results.faceLandmarks !== 'undefined'){
    sd.startDetect(results.faceLandmarks);
    sd.drawOnCanvas(canvasCtx);
    sd.checkForSmile();
  }

  if(typeof results.faceLandmarks !== 'undefined'){
    eyebrowDetector.startDetect(results.faceLandmarks);
    eyebrowDetector.drawOnCanvas(canvasCtx);
    eyebrowDetector.checkForEyebrowConfused()
  }
 
  if (typeof results.leftHandLandmarks !== 'undefined' || typeof results.rightHandLandmarks !== 'undefined') {
    hr.checkForHand(results.leftHandLandmarks, results.rightHandLandmarks, results.faceLandmarks);
  }

  


  //Use this to find coordinates
    // for (var i =0;i<results.faceLandmarks.length;i++){
    //   var testc = findCoordinates(results.faceLandmarks,i);
    //   canvasCtx.fillText(i, testc[0],testc[1]);
    // }

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




let namespace = "/web";
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



class SmileDetector{

  constructor(){
    this.frameSkip = 5;// allow frame skip
    this.currentFrame = 0;// Current frame size

    this.firstReading = true;
    this.smileLengthFactor = 1.1;

    this.smiling = false;

    this.previousData = {
      lengthOfLip : 0,
      dleftLipToLeftCorner: 0,
      dleftLipToLeftChin: 0,
      drightLipToRightCorner: 0,
      drightLipToRightChin: 0,
    }

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

  startDetect(lm){
     //291 and 61 are for lip corners
    var leftLipcornerCoordinates = findCoordinates(lm,291);
    this.x_for_left_lip_corner = leftLipcornerCoordinates[0];
    this.y_for_left_lip_corner = leftLipcornerCoordinates[1];

    var rightLipcornerCoordinates = findCoordinates(lm,61);
    this.x_for_right_lip_corner = rightLipcornerCoordinates[0];
    this.y_for_right_lip_corner = rightLipcornerCoordinates[1];

    var leftFaceCorner = findCoordinates(lm,58);
    this.x_for_left_face_corner = leftFaceCorner[0];
    this.y_for_left_face_corner = leftFaceCorner[1];

    var rightFaceCorner = findCoordinates(lm,288);
    this.x_for_right_face_corner = rightFaceCorner[0];
    this.y_for_right_face_corner = rightFaceCorner[1];

    var leftChinCorner = findCoordinates(lm,149);
    this.x_for_left_chin_corner = leftChinCorner[0];
    this.y_for_left_chin_corner = leftChinCorner[1];

    var rightChinCorner = findCoordinates(lm,378);
    this.x_for_right_chin_corner = rightChinCorner[0];
    this.y_for_right_chin_corner = rightChinCorner[1];
  }

  drawOnCanvas(canvasCtx){
    canvasCtx.fillRect(this.x_for_left_lip_corner,this.y_for_left_lip_corner,5,5);
    canvasCtx.fillRect(this.x_for_right_lip_corner,this.y_for_right_lip_corner,5,5);

    canvasCtx.fillRect(this.x_for_left_face_corner,this.y_for_left_face_corner,5,5);
    canvasCtx.fillRect(this.x_for_right_face_corner,this.y_for_right_face_corner,5,5);

    canvasCtx.fillRect(this.x_for_left_chin_corner,this.y_for_left_chin_corner,5,5);
    canvasCtx.fillRect(this.x_for_right_chin_corner,this.y_for_right_chin_corner,5,5);
  }

  checkForSmile(){

    if(this.firstReading === true){
      this.firstReading = false;
      return;
    }

    //Distance between ends of lips
    var dLips = Math.sqrt( 
      Math.pow((this.x_for_left_lip_corner-this.x_for_right_lip_corner), 2) 
      + 
      Math.pow((this.y_for_left_lip_corner-this.y_for_right_lip_corner), 2) 
    );

    //distance Left Lip To Left Corner
    var dLLTLFaceC = Math.sqrt( 
      Math.pow((this.x_for_left_lip_corner-this.x_for_left_face_corner), 2) 
      + 
      Math.pow((this.y_for_left_lip_corner-this.y_for_left_face_corner), 2) 
    );

    //distance Left Lip To Left Chin
    var dLLTLChinC = Math.sqrt( 
      Math.pow((this.x_for_left_lip_corner-this.x_for_left_chin_corner), 2) 
      + 
      Math.pow((this.y_for_left_lip_corner-this.y_for_left_chin_corner), 2) 
    );
    
     //distance Right Lip To Right Corner
     var dRLTRFaceC = Math.sqrt( 
      Math.pow((this.x_for_right_lip_corner-this.x_for_right_face_corner), 2) 
      + 
      Math.pow((this.y_for_right_lip_corner-this.y_for_right_face_corner), 2) 
    );

    //distance Right Lip To Right Chin
    var dRLTRChinC = Math.sqrt( 
      Math.pow((this.x_for_right_lip_corner-this.x_for_right_chin_corner), 2) 
      + 
      Math.pow((this.y_for_right_lip_corner-this.y_for_right_chin_corner), 2) 
    );

      if(this.currentFrame % this.frameSkip == 0){
        var previousValues = this.previousData;
        if(dLips > (previousValues.lengthOfLip * this.smileLengthFactor) && 
          dLLTLChinC > previousValues.dleftLipToLeftChin &&
          dRLTRChinC > previousValues.drightLipToRightChin
          ){
            console.log("You Smiled");
            socket.emit('smile', "I smiled");
          }

        previousValues.lengthOfLip = dLips;
        previousValues.dleftLipToLeftCorner = dLLTLFaceC;
        previousValues.dleftLipToLeftChin = dLLTLChinC;
        previousValues.drightLipToRightCorner = dRLTRFaceC;
        previousValues.drightLipToRightChin = dRLTRChinC;

       


      }
      this.currentFrame +=1;
      if(this.currentFrame >=10000){
        this.currentFrame = 0;
      }

  }

}

class EyeBrowDetector{

  constructor(){
    this.frameSkip = 5;// allow frame skip
    this.currentFrame = 0;// Current frame size

    this.firstReading = true;
    this.eyebrowsDistanceLengthFactor = 1.02;
    this.eyebrowsEyeLengthFactor = 1.02
  
    this.previousData = {
      prev_distance_x_eyebrows_start : 0,
      prev_distance_y_left_eyebrow : 0,
      prev_distance_y_right_eyebrow : 0,
      prev_y_for_left_eyebrow_start : 0,
      prev_y_for_right_eyebrow_start : 0,
    }

    //Landmark points of interest to eyebrows confused
    this.x_for_left_eyebrow_start = 0;
    this.y_for_left_eyebrow_start = 0;

    this.x_for_right_eyebrow_start = 0;
    this.y_for_right_eyebrow_start = 0;

    this.y_for_left_eye_corner = 0;
    this.y_for_right_eye_corner = 0;

    this.const_distance_y_left_eyebrow = 0;
    this.const_distance_y_right_eyebrow = 0;

    this.eyebrownsCloser = false;
    this.eyebrownsLower = false;
    this.confused = false

  }

  drawOnCanvas(canvasCtx){
      canvasCtx.fillRect(this.x_for_left_eyebrow_start,this.y_for_left_eyebrow_start,5,5);
      canvasCtx.fillRect(this.x_for_right_eyebrow_start,this.y_for_right_eyebrow_start,5,5);
  }
  

  startDetect(lm){
      
      //start of left eyebrow is 336
      let leftEyebrowStartCoordinates = findCoordinates(lm,336);
      this.x_for_left_eyebrow_start = leftEyebrowStartCoordinates[0];
      this.y_for_left_eyebrow_start = leftEyebrowStartCoordinates[1];

      //start of right eyebrow is 107
      let rightEyebrowStartCoordinates = findCoordinates(lm,107);
      this.x_for_right_eyebrow_start = rightEyebrowStartCoordinates[0];
      this.y_for_right_eyebrow_start = rightEyebrowStartCoordinates[1];

      //start of left eye corner is 362
      let leftEyeCornerCoordinates = findCoordinates(lm, 362)
      this.y_for_left_eye_corner = leftEyeCornerCoordinates[1]

      //start of right eye corner is 133
      let rightEyeCornerCoordinates = findCoordinates(lm, 133)
      this.y_for_right_eye_corner = rightEyeCornerCoordinates[1];

      if (this.firstReading) {
        this.const_distance_y_left_eyebrow = Math.abs(this.y_for_left_eyebrow_start - this.y_for_left_eye_corner)
        this.const_distance_y_right_eyebrow = Math.abs(this.y_for_right_eyebrow_start - this.y_for_right_eye_corner)
      }

      this.eyebrownsCloser = false
      this.eyebrownsLower = false
      this.confused = false
  }

  checkForEyebrowConfused(){

    if(this.firstReading === true){
      this.firstReading = false;
      return;
    }

    //Distance between start of eyebrows
    let distance_x_eyebrows_start = Math.abs(this.x_for_left_eyebrow_start - this.x_for_right_eyebrow_start);
    let distance_y_left_eyebrows = Math.abs(this.y_for_left_eyebrow_start - this.y_for_left_eye_corner);
    let distance_y_right_eyebrows = Math.abs(this.y_for_right_eyebrow_start - this.y_for_right_eye_corner);
  //   let distance_y_right_eyebrows = Math.abs(this.y.x_for_right_eyebrow_start - this.previousData.prev_y_for_right_eyebrow_start);

      if(this.currentFrame % this.frameSkip == 0){
        let previousValues = this.previousData;

        if (distance_x_eyebrows_start * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_x_eyebrows_start) {
          // console.log("distance X is smaller than before");
          this.eyebrownsCloser = true;
        }

        // if (distance_y_left_eyebrows * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_y_left_eyebrow) {
        //   console.log("distance Y LEFT is smaller than before");
        // }

        // if (distance_y_right_eyebrows * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_y_right_eyebrow) {
        //   console.log("distance Y RIGHT is smaller than before");
        // }

        if ((distance_y_left_eyebrows * this.eyebrowsEyeLengthFactor < this.const_distance_y_left_eyebrow) || 
        (distance_y_right_eyebrows * this.eyebrowsEyeLengthFactor < this.const_distance_y_right_eyebrow)) {
          // console.log("distance Y is smaller than before");
          this.eyebrownsLower = true
        }

        if (this.eyebrownsCloser && this.eyebrownsLower) {
          console.log("You are confused!")
          socket.emit('confused', "I am confused");
          this.confused = true
        }

        // if (distance_y_right_eyebrows * this.eyebrowsEyeLengthFactor < this.const_distance_y_right_eyebrow) {
        //   console.log("distance Y RIGHT is smaller than before");
        // }
        // if ((distance_y_left_eyebrows * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_y_left_eyebrow) || 
        // (distance_y_right_eyebrows * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_y_right_eyebrow)) {
        //   console.log("distance Y is smaller than before");
        // }
        
        
      //   if((distance_x_eyebrows_start < previousValues.prev_distance_x_eyebrows_start) && 
      //     ((this.y_for_left_eyebrow_start < previousValues.prev_y_for_left_eyebrow_start) || (this.y_for_right_eyebrow_start < previousValues.prev_y_for_right_eyebrow_start))
      //     ){
      //       console.log("Your eyebrows confused");
      //       socket.emit('eyebrows confused', "I'm confused");
      //     }

        previousValues.prev_distance_x_eyebrows_start = distance_x_eyebrows_start;
        previousValues.prev_y_for_left_eyebrow_start = this.y_for_left_eyebrow_start
        previousValues.prev_y_for_right_eyebrow_start = this.y_for_right_eyebrow_start
        previousValues.prev_distance_y_left_eyebrow = distance_y_left_eyebrows
        previousValues.prev_distance_y_right_eyebrow = distance_y_right_eyebrows
      }
      this.currentFrame +=1;
      if(this.currentFrame >=10000){
        this.currentFrame = 0;
      }
  }

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
      
      if (palm) { 
        console.log('You raised your hand'); 
        socket.emit('handraise', "I raised my hand");

      } // eslint-disable-line}
    }
    
    this.frameCounter++;
  }

}

const sd = new SmileDetector();
const eyebrowDetector = new EyeBrowDetector();
const hr = new HandRaised();






