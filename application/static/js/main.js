const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

let IS_SMILING = false;
let IS_CONFUSED = false;
let IS_SURPRISED= false;
let IS_HAND_RAISED = false;
let IS_THUMBS_UP = false;
const MAX_FRAMES = 10000;

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


  if (typeof results.faceLandmarks !== 'undefined') {
    sd.startDetect(results.faceLandmarks);
    sd.drawOnCanvas(canvasCtx);
    sd.checkForSmile();

    eyebrowDetector.startDetect(results.faceLandmarks);
    eyebrowDetector.drawOnCanvas(canvasCtx);
    eyebrowDetector.checkForEyebrowConfused()
    eyebrowDetector.checkForSurprise() 

    // nd.startDetect(results.faceLandmarks);
  } else {
    IS_CONFUSED = false;
    IS_SMILING = false;
  }

  if (typeof results.leftHandLandmarks !== 'undefined' || typeof results.rightHandLandmarks !== 'undefined') {
    hr.checkForHand(results.leftHandLandmarks, results.rightHandLandmarks, results.faceLandmarks);
    hr.checkforThumbsUp(results.leftHandLandmarks, results.rightHandLandmarks);
  } else {
    IS_HAND_RAISED = false;
    IS_THUMBS_UP = false;
  }

  //Use this to find coordinates
  // for (var i =0;i<results.faceLandmarks.length;i++){
  //   var testc = findCoordinates(results.faceLandmarks,i);
  //   canvasCtx.fillText(i, testc[0],testc[1]);
  // }

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


let namespace = '/web';
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
socket.on('connect', function() {
  var userName = $.urlParam('name');
  var userEmoji = $.urlParam('emoji');
  socket.emit('initialData', { name: userName, emoji:userEmoji });
  console.log('Connection successful');
});

// Code copied from https://stackoverflow.com/questions/7731778/get-query-string-parameters-url-values-with-jquery-javascript-querystring
$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                    .exec(window.location.search);

  return (results !== null) ? results[1] || 0 : false;
}

// Written by Aman
// Finds x,y coordinate of a landmark
function findCoordinates(toEnumerate, idToFind) {
  var width = canvasElement.width;
  var height = canvasElement.height;
  var cx = parseInt(toEnumerate[idToFind].x * width);
  var cy = parseInt(toEnumerate[idToFind].y * height);
  return [cx, cy];
}

class SmileDetector {
  constructor() {
    this.frameSkip = 5; // allow frame skip
    this.currentFrame = 0; // Current frame size

    this.firstReading = true;
    this.smileLengthFactor = 1.1;
    this.endSmileFactor = .9;

    this.previousData = {
      lengthOfLip: 0,
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

  startDetect(lm) {
    //291 and 61 are for lip corners
    var leftLipcornerCoordinates = findCoordinates(lm, 291);
    this.x_for_left_lip_corner = leftLipcornerCoordinates[0];
    this.y_for_left_lip_corner = leftLipcornerCoordinates[1];

    var rightLipcornerCoordinates = findCoordinates(lm, 61);
    this.x_for_right_lip_corner = rightLipcornerCoordinates[0];
    this.y_for_right_lip_corner = rightLipcornerCoordinates[1];

    var leftFaceCorner = findCoordinates(lm, 58);
    this.x_for_left_face_corner = leftFaceCorner[0];
    this.y_for_left_face_corner = leftFaceCorner[1];

    var rightFaceCorner = findCoordinates(lm, 288);
    this.x_for_right_face_corner = rightFaceCorner[0];
    this.y_for_right_face_corner = rightFaceCorner[1];

    var leftChinCorner = findCoordinates(lm, 149);
    this.x_for_left_chin_corner = leftChinCorner[0];
    this.y_for_left_chin_corner = leftChinCorner[1];

    var rightChinCorner = findCoordinates(lm, 378);
    this.x_for_right_chin_corner = rightChinCorner[0];
    this.y_for_right_chin_corner = rightChinCorner[1];
  }

  drawOnCanvas(canvasCtx) {
    canvasCtx.fillRect(this.x_for_left_lip_corner, this.y_for_left_lip_corner, 5, 5);
    canvasCtx.fillRect(this.x_for_right_lip_corner, this.y_for_right_lip_corner, 5, 5);

    canvasCtx.fillRect(this.x_for_left_face_corner, this.y_for_left_face_corner, 5, 5);
    canvasCtx.fillRect(this.x_for_right_face_corner, this.y_for_right_face_corner, 5, 5);

    canvasCtx.fillRect(this.x_for_left_chin_corner, this.y_for_left_chin_corner, 5, 5);
    canvasCtx.fillRect(this.x_for_right_chin_corner, this.y_for_right_chin_corner, 5, 5);
  }

  checkForSmile() {
    if (this.firstReading === true) {
      this.firstReading = false;
      return;
    }

    //Distance between ends of lips
    var dLips = Math.sqrt(
      Math.pow((this.x_for_left_lip_corner - this.x_for_right_lip_corner), 2) +
      Math.pow((this.y_for_left_lip_corner - this.y_for_right_lip_corner), 2)
    );

    //distance Left Lip To Left Corner
    var dLLTLFaceC = Math.sqrt(
      Math.pow((this.x_for_left_lip_corner - this.x_for_left_face_corner), 2) +
      Math.pow((this.y_for_left_lip_corner - this.y_for_left_face_corner), 2)
    );

    //distance Left Lip To Left Chin
    var dLLTLChinC = Math.sqrt(
      Math.pow((this.x_for_left_lip_corner - this.x_for_left_chin_corner), 2) +
      Math.pow((this.y_for_left_lip_corner - this.y_for_left_chin_corner), 2)
    );

    //distance Right Lip To Right Corner
    var dRLTRFaceC = Math.sqrt(
      Math.pow((this.x_for_right_lip_corner - this.x_for_right_face_corner), 2) +
      Math.pow((this.y_for_right_lip_corner - this.y_for_right_face_corner), 2)
    );

    //distance Right Lip To Right Chin
    var dRLTRChinC = Math.sqrt(
      Math.pow((this.x_for_right_lip_corner - this.x_for_right_chin_corner), 2) +
      Math.pow((this.y_for_right_lip_corner - this.y_for_right_chin_corner), 2)
    );

    if (this.currentFrame % this.frameSkip == 0) {
      var previousValues = this.previousData;
      if (dLips > (previousValues.lengthOfLip * this.smileLengthFactor) &&
        dLLTLChinC > previousValues.dleftLipToLeftChin &&
        dRLTRChinC > previousValues.drightLipToRightChin && !eyebrowDetector.surprised
      ) {
        if (!IS_SMILING) {
          console.log('add smile'); // eslint-disable-line
          socket.emit('smile', { value: 1 });
        }
        IS_SMILING = true;
      }

      if (dLips < (previousValues.lengthOfLip * this.endSmileFactor) &&
        dLLTLChinC < previousValues.dleftLipToLeftChin &&
        dRLTRChinC < previousValues.drightLipToRightChin
      ) {
        if (IS_SMILING) {
          console.log('remove smile'); // eslint-disable-line
          socket.emit('smile', { value: -1 });
        }
        IS_SMILING = false;
      }
      previousValues.lengthOfLip = dLips;
      previousValues.dleftLipToLeftCorner = dLLTLFaceC;
      previousValues.dleftLipToLeftChin = dLLTLChinC;
      previousValues.drightLipToRightCorner = dRLTRFaceC;
      previousValues.drightLipToRightChin = dRLTRChinC;
    }

    this.currentFrame++;
    if (this.currentFrame >= MAX_FRAMES) {
      this.currentFrame = 0;
    }
  }
}

class NodDetector {
  constructor(){
    this.imagePoints = []
    this.imageShape = [0,0]
  }
  startDetect(lm){
    this.imagePoints = [];
      
    //start of left eyebrow is 336
    let noseTip = findCoordinates(lm,4);
    this.x_noseTip = noseTip[0];
    this.y_noseTip = noseTip[1];

    var toAdd = [this.x_noseTip, this.y_noseTip];
    this.imagePoints.push(toAdd);


    //start of left eyebrow is 336
    let chin = findCoordinates(lm,175);
    this.x_chin = chin[0];
    this.y_chin = chin[1];

    var toAdd = [this.x_chin, this.y_chin];
    this.imagePoints.push(toAdd);

    //start of left eyebrow is 336
    let leftEye = findCoordinates(lm,33);
    this.x_leftEye = leftEye[0];
    this.y_leftEye = leftEye[1];

    var toAdd = [this.x_leftEye, this.y_leftEye];
    this.imagePoints.push(toAdd);

    //start of left eyebrow is 336
    let rightEye = findCoordinates(lm,263);
    this.x_rightEye = rightEye[0];
    this.y_rightEye = rightEye[1];

    var toAdd = [this.x_rightEye, this.y_rightEye];
    this.imagePoints.push(toAdd);

    //start of left eyebrow is 336
    let leftLip = findCoordinates(lm,291);
    this.x_leftLip = leftLip[0];
    this.y_leftLip = leftLip[1];

    var toAdd = [this.x_leftLip, this.y_leftLip];
    this.imagePoints.push(toAdd);

    //start of left eyebrow is 336
    let rightLip = findCoordinates(lm,61);
    this.x_rightLip = rightLip[0];
    this.y_rightLip = rightLip[1];

    var toAdd = [this.x_rightLip, this.y_rightLip];
    this.imagePoints.push(toAdd);
    socket.emit('nodDetection', {
      imagePoints: this.imagePoints, 
      imageShape: [canvasElement.height,canvasElement.width],
    });
  }
}

class EyeBrowDetector {
  constructor() {
    this.frameSkip = 10;// allow frame skip
    this.currentFrameConfused = 0;// Current frame size
    this.currentFrameSurprised = 0;

    this.firstReading = true;
    this.firstReadingSurprised = true;
    this.eyebrowsDistanceLengthFactor = 1.05;
    this.eyebrowsEyeLengthFactor = 1.05;
    this.eyeBrowChangeThreshold = 8;
    this.foreheadDistanceLengthFactor = 1.06;
    this.lipDistanceLengthFactor = 4;
  
    this.previousData = {
      prev_distance_x_eyebrows_start : 0,
      prev_distance_y_left_eyebrow : 0,
      prev_distance_y_right_eyebrow : 0,
      prev_y_for_left_eyebrow_start : 0,
      prev_y_for_right_eyebrow_start : 0,
      prev_y_for_left_eyebrow_middle : 0,
      prev_y_for_right_eyebrow_middle : 0,
      prev_distance_forehead_left : 0,
      prev_distance_forehead_right : 0,
      prev_distance_lip : 0,
      surprised: false,
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

    this.const_distance_z_left = 0;
    this.const_distance_z_right = 0;
    this.const_distance_z_average = 0;

    this.eyebrowsCloser = false;
    this.eyebrowsLower = false;
    this.confused = false

    //Landmark points of interest to eyebrows surprised
    this.y_for_left_eyebrow_middle = 0;
    this.y_for_right_eyebrow_middle = 0;
    this.x_for_left_eyebrow_middle = 0;
    this.x_for_right_eyebrow_middle = 0;

    this.y_for_left_forehead = 0;
    this.y_for_right_forehead = 0;

    //Landmark points of interest to lips surprised
    this.y_for_upper_lip = 0;
    this.y_for_lower_lip = 0;
    this.x_for_upper_lip = 0;
    this.x_for_lower_lip = 0;

    this.eyebrowsRaised = false;
    this.lipOpen = false;
    this.surprised = false;
  }

  drawOnCanvas(canvasCtx) {
    canvasCtx.fillRect(this.x_for_left_eyebrow_start,this.y_for_left_eyebrow_start,5,5);
    canvasCtx.fillRect(this.x_for_right_eyebrow_start,this.y_for_right_eyebrow_start,5,5);
    canvasCtx.fillRect(this.x_for_left_eyebrow_middle,this.y_for_left_eyebrow_middle,5,5);
    canvasCtx.fillRect(this.x_for_right_eyebrow_middle,this.y_for_right_eyebrow_middle,5,5);
    canvasCtx.fillRect(this.x_for_upper_lip, this.y_for_upper_lip, 5, 5);
    canvasCtx.fillRect(this.x_for_lower_lip, this.y_for_lower_lip, 5, 5);
  }
  
  startDetect(lm) {
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
      // this.const_distance_z_left = leftEyeCornerCoordinates[2]

      //start of right eye corner is 133
      let rightEyeCornerCoordinates = findCoordinates(lm, 133)
      this.y_for_right_eye_corner = rightEyeCornerCoordinates[1];
      // this.const_distance_z_right = rightEyeCornerCoordinates[2]

      //middle of left eyebrow is 334
      let leftEyebrowMiddleCoordinates = findCoordinates(lm, 334)
      this.x_for_left_eyebrow_middle = leftEyebrowMiddleCoordinates[0]
      this.y_for_left_eyebrow_middle = leftEyebrowMiddleCoordinates[1]

      //middle of right eyebrow is 105
      let rightEyebrowMiddleCoordinates = findCoordinates(lm, 105)
      this.x_for_right_eyebrow_middle = rightEyebrowMiddleCoordinates[0]
      this.y_for_right_eyebrow_middle = rightEyebrowMiddleCoordinates[1]

      //left forehead is 297
      let leftForeheadCoordinates = findCoordinates(lm, 297)
      this.y_for_left_forehead = leftForeheadCoordinates[1]

      //right forehead is 67
      let rightForeheadCoordinates = findCoordinates(lm, 67)
      this.y_for_right_forehead = rightForeheadCoordinates[1]

      //upper lip is 13, lower lip is 14
      let upperLipCoordinates = findCoordinates(lm, 13)
      this.y_for_upper_lip = upperLipCoordinates[1]
      this.x_for_upper_lip = upperLipCoordinates[0]

      let lowerLipCoordinates = findCoordinates(lm, 14)
      this.y_for_lower_lip = lowerLipCoordinates[1]
      this.x_for_lower_lip = lowerLipCoordinates[0]

      // this.const_distance_z_average = (this.const_distance_z_left + this.const_distance_z_right) / 2;

      if (this.firstReading) {
        this.const_distance_y_left_eyebrow = Math.abs(this.y_for_left_eyebrow_start - this.y_for_left_eye_corner)
        this.const_distance_y_right_eyebrow = Math.abs(this.y_for_right_eyebrow_start - this.y_for_right_eye_corner)
      }

      this.eyebrowsCloser = false
      this.eyebrowsLower = false
      this.confused = false

      this.eyebrowsRaised = false
      this.lipOpen = false
      // if (this.previousData.surprised == false) {
      //   this.surprised = false
      // }
      this.surprised = false
  }

  checkForEyebrowConfused() {
    if(this.firstReading === true){
      this.firstReading = false;
      return;
    }

    //Distance between start of eyebrows
    let distance_x_eyebrows_start = Math.abs(this.x_for_left_eyebrow_start - this.x_for_right_eyebrow_start);
    let distance_y_left_eyebrows = Math.abs(this.y_for_left_eyebrow_start - this.y_for_left_eye_corner);
    let distance_y_right_eyebrows = Math.abs(this.y_for_right_eyebrow_start - this.y_for_right_eye_corner);
    //   let distance_y_right_eyebrows = Math.abs(this.y.x_for_right_eyebrow_start - this.previousData.prev_y_for_right_eyebrow_start);

      if(this.currentFrameConfused % this.frameSkip == 0) {
        let previousValues = this.previousData;

        // console.log('prev distance: ' + previousValues.prev_distance_x_eyebrows_start)
        // console.log('current distance: ' + distance_x_eyebrows_start)
        if (distance_x_eyebrows_start * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_x_eyebrows_start) {
          // console.log('distance X is smaller than before');
          // console.log('z distance is: ' + this.const_distance_z_average)
          this.eyebrowsCloser = true;
        }

        if ((distance_y_left_eyebrows * this.eyebrowsEyeLengthFactor < previousValues.prev_distance_y_left_eyebrow) || 
        (distance_y_right_eyebrows * this.eyebrowsEyeLengthFactor < previousValues.prev_distance_y_right_eyebrow)) {
          // console.log('distance Y is smaller than before');
          this.eyebrowsLower = true;
        }

        // if ((distance_y_left_eyebrows * this.eyebrowsEyeLengthFactor < this.const_distance_y_left_eyebrow) || 
        // (distance_y_right_eyebrows * this.eyebrowsEyeLengthFactor < this.const_distance_y_right_eyebrow)) {
        //   console.log('distance Y is smaller than before');
        //   this.eyebrowsLower = true;
        //   // console.log('z distance is: ' + this.const_distance_z_average);
        // }

        if (this.eyebrowsCloser && this.eyebrowsLower && !previousValues.surprised) {
          if (!IS_CONFUSED) {
            console.log('add confused'); // eslint-disable-line
            socket.emit('confused', { value: 1 });
          }
  
          IS_CONFUSED = true;
          this.confused = true;
        }

        if ((distance_x_eyebrows_start * this.eyebrowsDistanceLengthFactor > previousValues.prev_distance_x_eyebrows_start) &&
            ((distance_y_left_eyebrows * this.eyebrowsEyeLengthFactor > previousValues.prev_distance_y_left_eyebrow) || 
            (distance_y_right_eyebrows * this.eyebrowsEyeLengthFactor > previousValues.prev_distance_y_right_eyebrow))) {
          if (IS_CONFUSED) {
            console.log('remove confused'); // eslint-disable-line
            socket.emit('confused', { value: -1 });
          }
  
          IS_CONFUSED = false;
        }

        // if ((distance_y_left_eyebrows * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_y_left_eyebrow) || 
        // (distance_y_right_eyebrows * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_y_right_eyebrow)) {
        //   console.log('distance Y is smaller than before');
        // }
       
        previousValues.prev_distance_x_eyebrows_start = distance_x_eyebrows_start;
        previousValues.prev_y_for_left_eyebrow_start = this.y_for_left_eyebrow_start
        previousValues.prev_y_for_right_eyebrow_start = this.y_for_right_eyebrow_start
        previousValues.prev_distance_y_left_eyebrow = distance_y_left_eyebrows
        previousValues.prev_distance_y_right_eyebrow = distance_y_right_eyebrows
      }
      this.currentFrameConfused++;
      if(this.currentFrameConfused >= MAX_FRAMES){
        this.currentFrameConfused = 0;
      }
  }

  checkForSurprise() {
    if(this.firstReadingSurprised === true){
      this.firstReadingSurprised = false;
      return;
    }
    //Distance between eyebrow and forehead
    let leftForeheadDistance = Math.abs(this.y_for_left_eyebrow_middle - this.y_for_left_forehead)
    let rightForeheadDistance = Math.abs(this.y_for_right_eyebrow_middle - this.y_for_right_forehead)

    //Distance between upper and lower lip
    let distanceBetweenLips = Math.abs(this.y_for_upper_lip - this.y_for_lower_lip)

    if(this.currentFrameSurprised % this.frameSkip == 0){
      let previousValues = this.previousData;
      // console.log('check for surprised');
      //Distance between current and previous middles of eyebrows
      // let leftEyebrowChange = Math.abs(this.y_for_left_eyebrow_middle - previousValues.prev_y_for_left_eyebrow_middle)
      // let rightEyebrowChange = Math.abs(this.y_for_right_eyebrow_middle - previousValues.prev_y_for_right_eyebrow_middle)
      // console.log('left eyebrow: ' + leftEyebrowChange);
      // console.log('right eyebrow: ' + rightEyebrowChange);

      if ((leftForeheadDistance * this.foreheadDistanceLengthFactor < previousValues.prev_distance_forehead_left) &&
      (rightForeheadDistance * this.foreheadDistanceLengthFactor < previousValues.prev_distance_forehead_right)) {
        // console.log('eyebrows raised')
        // console.log('You are surprised')
        this.eyebrowsRaised = true;
      }

      if (previousValues.prev_distance_lip * this.lipDistanceLengthFactor < distanceBetweenLips) {
        // console.log('Lips are open')
        this.lipOpen = true;
      }
      // if (leftEyebrowChange > this.eyeBrowChangeThreshold && rightEyebrowChange > this.eyeBrowChangeThreshold) {
      //   console.log('Eyebrows raised')
      // }

      if (this.eyebrowsRaised && this.lipOpen) {
        this.surprised = true;
        if (!IS_SURPRISED) {
          console.log('add surprised'); // eslint-disable-line
          socket.emit('surprised', { value: 1 });
        }

        IS_SURPRISED = true;
      }
      
      if (((leftForeheadDistance * this.foreheadDistanceLengthFactor > previousValues.prev_distance_forehead_left) &&
      (rightForeheadDistance * this.foreheadDistanceLengthFactor > previousValues.prev_distance_forehead_right)) &&
      (previousValues.prev_distance_lip * this.lipDistanceLengthFactor > distanceBetweenLips)) {
        if (IS_SURPRISED) {
          console.log('remove surprised'); // eslint-disable-line
          socket.emit('surprised', { value: -1 });
        }

        IS_SURPRISED = false;
      }

      previousValues.prev_y_for_left_eyebrow_middle = this.y_for_left_eyebrow_middle
      previousValues.prev_y_for_right_eyebrow_middle = this.y_for_right_eyebrow_middle
      previousValues.prev_distance_forehead_left = leftForeheadDistance
      previousValues.prev_distance_forehead_right = rightForeheadDistance
      previousValues.prev_distance_lip = distanceBetweenLips
      previousValues.surprised = this.surprised
    }

    this.currentFrameSurprised++;
    if(this.currentFrameSurprised >= MAX_FRAMES){
      this.currentFrameSurprised = 0;
    }
  }
}

class HandRaised {
  constructor() {
    this.skipFrame = 10;
    this.frameCounterHandRaise = 0;
    this.frameCounterThumbsUp = 0;
    this.minY = 0;
    this.thumbsLengthFactor = 1.2;
    this.thumbsCloseFactor = 1.02;
    this.thumbsUp = false;
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
    if (this.frameCounterHandRaise % this.skipFrame === 0) {
      this.minY = this.getMinFaceY(face);
      let palm = false;
      if (leftHand !== undefined) {
        if (this.checkForPalm(leftHand)) {
          palm = true;
        }
      }
      if (rightHand !== undefined) {
        if (this.checkForPalm(rightHand)) {
          palm = true;
        }
      }
      
      if (palm) {
        if (!IS_HAND_RAISED) {
          console.log('add hand'); // eslint-disable-line
          socket.emit('handraise', { value: 1 });
        }

        IS_HAND_RAISED = true;
      } else {
        if (IS_HAND_RAISED) {
          console.log('remove hand'); // eslint-disable-line
          socket.emit('handraise', { value: -1 });
        }
        IS_HAND_RAISED = false;
      }
    }

    this.frameCounterHandRaise++;
    if (this.frameCounterHandRaise >= MAX_FRAMES){
      this.frameCounterHandRaise = 0;
    }
  }

  checkforThumbsUp(leftHand, rightHand) {
    if (this.frameCounterThumbsUp % this.skipFrame === 0) {
      let rightHandThumbsUp = this.checkforOneHandThumbsUp(rightHand);
      // let leftHandThumbsUp = this.checkforOneHandThumbsUp(leftHand);
      if (rightHandThumbsUp) {
        if (!IS_THUMBS_UP) {
          console.log('add thumb'); // eslint-disable-line
          socket.emit('thumb', { value: 1 });
        }

        IS_THUMBS_UP = true;
      } else {
        if (IS_THUMBS_UP) {
          console.log('remove thumb'); // eslint-disable-line
          socket.emit('thumb', { value: -1 });
        }
        IS_THUMBS_UP = false;
      }
      // if (rightHandThumbsUp || leftHandThumbsUp) {
      //   this.thumbsUp = true;
      //   console.log('Thumbs up');
      // }
    }
    this.frameCounterThumbsUp++;
    if (this.frameCounterThumbsUp >= MAX_FRAMES){
      this.frameCounterThumbsUp = 0;
    }
  }

  checkforOneHandThumbsUp(targetHand) {
    //finger tip coordinates
    let y_rightThumbTip = findCoordinates(targetHand, 4)[1];
    let x_rightIndexTip = findCoordinates(targetHand, 8)[0];
    let x_rightMiddleTip = findCoordinates(targetHand, 12)[0];
    let x_rightRingTip = findCoordinates(targetHand, 16)[0];
    let x_rightPinkyTip = findCoordinates(targetHand, 20)[0];

    //finger MCP coordinates
    let y_rightIndexMCP = findCoordinates(targetHand, 5)[1];
    let y_rightMiddleMCP = findCoordinates(targetHand, 9)[1];
    let y_rightRingMCP = findCoordinates(targetHand, 13)[1];
    let y_rightPinkyMCP = findCoordinates(targetHand, 17)[1];

    //finger PIP coordinates
    let x_rightIndexPIP = findCoordinates(targetHand, 6)[0];
    let x_rightMiddlePIP = findCoordinates(targetHand, 10)[0];
    let x_rightRingPIP = findCoordinates(targetHand, 14)[0];
    let x_rightPinkyPIP = findCoordinates(targetHand, 19)[0];
  
    let y_thumbsUp = false;
    if (y_rightThumbTip * this.thumbsLengthFactor < y_rightIndexMCP && 
      y_rightIndexMCP < y_rightMiddleMCP && 
      y_rightMiddleMCP  < y_rightRingMCP && 
      y_rightRingMCP < y_rightPinkyMCP) {
        // console.log('thumb higher');
        y_thumbsUp = true;
    }
    let x_thumbsUp = false;
    if (x_rightIndexTip * this.thumbsCloseFactor < x_rightIndexPIP &&
      x_rightMiddleTip * this.thumbsCloseFactor < x_rightMiddlePIP &&
      x_rightRingTip * this.thumbsCloseFactor < x_rightRingPIP &&
      x_rightPinkyTip * this.thumbsCloseFactor < x_rightPinkyPIP) 
    {
      // console.log('hand close');
      x_thumbsUp = true;
    }

    if (y_thumbsUp && x_thumbsUp) {
      // console.log('One hand Thumbs up');
      return true;
    }
    return false;
  }
}

const sd = new SmileDetector();
const eyebrowDetector = new EyeBrowDetector();
const hr = new HandRaised();
const nd = new NodDetector();
