const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');


class EyeBrowDetector{

    constructor(){
      this.frameSkip = 5;// allow frame skip
      this.currentFrame = 0;// Current frame size
  
      this.firstReading = true;
      this.smileLengthFactor = 1.1;
  
      this.smiling = false;
  
      this.previousData = {
        prev_distance_x_eyebrows_start : 0,
        prev_y_for_left_eyebrow_start : 0,
        prev_y_for_right_eyebrow_start : 0,
      }
  
      //Landmark points of interest to eyebrows confused
      this.x_for_left_eyebrow_start = 0;
      this.y_for_left_eyebrow_start = 0;

      this.x_for_right_eyebrow_start = 0;
      this.y_for_right_eyebrow_start = 0;

    }
  
    startDetect(lm){
       //291 and 61 are for lip corners
      let leftEyebrowStartCoordinates = findCoordinates(lm,285);
      this.x_for_left_eyebrow_start = leftEyebrowStartCoordinates[0];
      this.y_for_left_eyebrow_start = leftEyebrowStartCoordinates[1];
  
      let rightEyebrowStartCoordinates = findCoordinates(lm,55);
      this.x_for_right_eyebrow_start = rightEyebrowStartCoordinates[0];
      this.y_for_right_eyebrow_start = rightEyebrowStartCoordinates[1];

    }

    checkForEyebrowConfused(){
  
      if(this.firstReading === true){
        this.firstReading = false;
        return;
      }
  
      //Distance between start of eyebrows
      let distance_x_eyebrows_start = Math.abs(this.x_for_left_eyebrow_start - this.x_for_right_eyebrow_start);
    //   let distance_y_left_eyebrows = Math.abs(this.y.x_for_left_eyebrow_start - this.previousData.prev_y_for_left_eyebrow_start);
    //   let distance_y_right_eyebrows = Math.abs(this.y.x_for_right_eyebrow_start - this.previousData.prev_y_for_right_eyebrow_start);
  
        if(this.currentFrame % this.frameSkip == 0){
          let previousValues = this.previousData;
          
          if((distance_x_eyebrows_start < previousValues.prev_distance_x_eyebrows_start) && 
            ((this.y_for_left_eyebrow_start < previousValues.prev_y_for_left_eyebrow_start) || (this.y_for_right_eyebrow_start < previousValues.prev_y_for_right_eyebrow_start))
            ){
              console.log("Your eyebrows confused");
              socket.emit('eyebrows confused', "I'm confused");
            }
  
          previousValues.prev_distance_x_eyebrows_start = distance_x_eyebrows_start;
          previousValues.prev_y_for_left_eyebrow_start = this.y_for_left_eyebrow_start
          previousValues.prev_y_for_right_eyebrow_start = this.y_for_right_eyebrow_start
        }
        this.currentFrame +=1;
        if(this.currentFrame >=10000){
          this.currentFrame = 0;
        }
    }

    drawOnCanvas(canvasCtx){
        canvasCtx.fillRect(this.x_for_left_lip_corner,this.y_for_left_lip_corner,5,5);
        canvasCtx.fillRect(this.x_for_right_lip_corner,this.y_for_right_lip_corner,5,5);
    
        canvasCtx.fillRect(this.x_for_left_face_corner,this.y_for_left_face_corner,5,5);
        canvasCtx.fillRect(this.x_for_right_face_corner,this.y_for_right_face_corner,5,5);
    
        canvasCtx.fillRect(this.x_for_left_chin_corner,this.y_for_left_chin_corner,5,5);
        canvasCtx.fillRect(this.x_for_right_chin_corner,this.y_for_right_chin_corner,5,5);
      }
    
  
  }


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
});



// Written by Aman
// Finds x,y coordinate of a landmark
function findCoordinates(toEnumerate, idToFind){
  let width = canvasElement.width;
  let height = canvasElement.height;
  let cx = parseInt(toEnumerate[idToFind].x * width);
  let cy = parseInt(toEnumerate[idToFind].y * height);
  return [cx, cy];
}





const sd = new SmileDetector();
