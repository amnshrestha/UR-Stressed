const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');


class EyeBrowDetector{

    constructor(){
      this.frameSkip = 10;// allow frame skip
      this.currentFrame = 0;// Current frame size
  
      this.firstReading = true;
      this.firstReadingSurprised = true;
      this.eyebrowsDistanceLengthFactor = 1.05;
      this.eyebrowsEyeLengthFactor = 1.1;
      this.eyeBrowChangeThreshold = 8;
      this.foreheadDistanceLengthFactor = 1.05;
    
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

      this.eyebrownsCloser = false;
      this.eyebrownsLower = false;
      this.confused = false

      //Landmark points of interest to eyebrows surprised
      this.y_for_left_eyebrow_middle = 0;
      this.y_for_right_eyebrow_middle = 0;
      this.x_for_left_eyebrow_middle = 0;
      this.x_for_right_eyebrow_middle = 0;

      this.y_for_left_forehead = 0;
      this.y_for_right_forehead = 0;

    }

    drawOnCanvas(canvasCtx){
        canvasCtx.fillRect(this.x_for_left_eyebrow_start,this.y_for_left_eyebrow_start,5,5);
        canvasCtx.fillRect(this.x_for_right_eyebrow_start,this.y_for_right_eyebrow_start,5,5);
        canvasCtx.fillRect(this.x_for_left_eyebrow_middle,this.y_for_left_eyebrow_middle,5,5);
        canvasCtx.fillRect(this.x_for_right_eyebrow_middle,this.y_for_right_eyebrow_middle,5,5);
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

        // this.const_distance_z_average = (this.const_distance_z_left + this.const_distance_z_right) / 2;

        if (this.firstReading) {
          this.const_distance_y_left_eyebrow = Math.abs(this.y_for_left_eyebrow_start - this.y_for_left_eye_corner)
          this.const_distance_y_right_eyebrow = Math.abs(this.y_for_right_eyebrow_start - this.y_for_right_eye_corner)
        }

        this.eyebrownsCloser = false
        this.eyebrownsLower = false
        this.confused = false
    }

    checkForEyebrowConfused(){
  
      if(this.firstReadingSurprised === true){
        this.firstReadingSurprised = false;
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
            // console.log("z distance is: " + this.const_distance_z_average)
            this.eyebrownsCloser = true;
          }

          if ((distance_y_left_eyebrows * this.eyebrowsEyeLengthFactor < previousValues.prev_distance_y_left_eyebrow) || 
          (distance_y_right_eyebrows * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_y_right_eyebrow)) {
            // console.log("distance Y is smaller than before");
            this.eyebrownsLower = true;
          }

          // if ((distance_y_left_eyebrows * this.eyebrowsEyeLengthFactor < this.const_distance_y_left_eyebrow) || 
          // (distance_y_right_eyebrows * this.eyebrowsEyeLengthFactor < this.const_distance_y_right_eyebrow)) {
          //   console.log("distance Y is smaller than before");
          //   this.eyebrownsLower = true;
          //   // console.log("z distance is: " + this.const_distance_z_average);
          // }

          if (this.eyebrownsCloser && this.eyebrownsLower) {
            console.log("You are confused!")
            this.confused = true
            // console.log("z distance is: " + this.const_distance_z_average)
          }

      
          // if ((distance_y_left_eyebrows * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_y_left_eyebrow) || 
          // (distance_y_right_eyebrows * this.eyebrowsDistanceLengthFactor < previousValues.prev_distance_y_right_eyebrow)) {
          //   console.log("distance Y is smaller than before");
          // }
         
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

    checkForEyebrowSurprised(){
  
      if(this.firstReading === true){
        this.firstReading = false;
        return;
      }
      let leftForeheadDistance = Math.abs(this.y_for_left_eyebrow_middle - this.y_for_left_forehead)
      let rightForeheadDistance = Math.abs(this.y_for_right_eyebrow_middle - this.y_for_right_forehead)

      if(this.currentFrame % this.frameSkip == 0){
        let previousValues = this.previousData;

        //Distance between current and previous middles of eyebrows
        // let leftEyebrowChange = Math.abs(this.y_for_left_eyebrow_middle - previousValues.prev_y_for_left_eyebrow_middle)
        // let rightEyebrowChange = Math.abs(this.y_for_right_eyebrow_middle - previousValues.prev_y_for_right_eyebrow_middle)
        // console.log("left eyebrow: " + leftEyebrowChange);
        // console.log("right eyebrow: " + rightEyebrowChange);

        if ((leftForeheadDistance * this.foreheadDistanceLengthFactor < previousValues.prev_distance_forehead_left) &&
        (rightForeheadDistance * this.foreheadDistanceLengthFactor < previousValues.prev_distance_forehead_right)) {
          console.log("You are surprised")
        }
        // if (leftEyebrowChange > this.eyeBrowChangeThreshold && rightEyebrowChange > this.eyeBrowChangeThreshold) {
        //   console.log("Eyebrows raised")
        // }

        previousValues.prev_y_for_left_eyebrow_middle = this.y_for_left_eyebrow_middle
        previousValues.prev_y_for_right_eyebrow_middle = this.y_for_right_eyebrow_middle
        previousValues.prev_distance_forehead_left = leftForeheadDistance
        previousValues.prev_distance_forehead_right = rightForeheadDistance
      }

      this.currentFrame +=1;
      if(this.currentFrame >=10000){
        this.currentFrame = 0;
      }
    }
  
}

const eyebrowDetector = new EyeBrowDetector()

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

      // Commented the following to Remove unnecessary drawings

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

  if(typeof results.faceLandmarks !== 'undefined'){
    eyebrowDetector.startDetect(results.faceLandmarks);
    eyebrowDetector.drawOnCanvas(canvasCtx);
    // eyebrowDetector.checkForEyebrowConfused()
    eyebrowDetector.checkForEyebrowSurprised()
  }


  //Use this to find coordinates
    // for (let i =0;i<results.faceLandmarks.length;i++){
    //   let testc = findCoordinates(results.faceLandmarks,i);
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
let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
socket.on('connect', function() {
    console.log('Connected!');
    console.log('running eyebrow')
});



// Written by Aman
// Finds x,y coordinate of a landmark
function findCoordinates(toEnumerate, idToFind){
  let width = canvasElement.width;
  let height = canvasElement.height;
  let cx = parseInt(toEnumerate[idToFind].x * width);
  let cy = parseInt(toEnumerate[idToFind].y * height);
  // let cz = parseInt(toEnumerate[idToFind].z * height);
  return [cx, cy];
}
