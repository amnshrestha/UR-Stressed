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



  sd.startDetect(results.faceLandmarks);
  sd.drawOnCanvas(canvasCtx);
  sd.checkForSmile();

  


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



class SmileDetector{

  constructor(){
    this.frameSkip = 10;// allow frame skip
    this.currentFrame = 0;// Current frame size
    this.previousLength = 0;
    this.smileLengthFactor = 1.1;

    // this.lengthOfLip = 0;
    // this.dleftLipToLeftCorner = 0;
    // this.dleftLipToLeftChin = 0;
    // this.drightLipToRightCorner = 0;
    // this.drightLipToRightChin = 0;
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
          }
          
          // console.log("------------------------");
          // console.log("Lips length: "+ dLips + " compared To "+ previousValues.lengthOfLip);
          // console.log("Left to left face: "+ dLLTLFaceC + " compared To "+ previousValues.dleftLipToLeftCorner);
          // console.log("Left to left chin: "+ dLLTLChinC + " compared To "+ previousValues.dleftLipToLeftChin);
          // console.log("Right to right face: "+ dRLTRFaceC + " compared To "+ previousValues.drightLipToRightCorner);
          // console.log("Right to right chin: "+ dRLTRChinC + " compared To "+ previousValues.drightLipToRightChin);
          // console.log("------------------------");

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

const sd = new SmileDetector();



class HandRaised{
  constructor(){

  }

}