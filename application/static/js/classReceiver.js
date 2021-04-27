const cloud = document.getElementById('cloud');

// Please remove this later
let namespace = '/web';
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace, {forceNew: true});



const emojis = [
  '✋', // hand raised
  '😀', // smile
  '🤔', // confused
  '😯',
  '👍',
  '❌',
  '✅'
];

const freqs = [
  0,
  0,
  0,
  0,
  0,
  0,
  0
];

function reset() {
  for (let i = 0; i < freqs.length; i++) {
    freqs[i] = 0;
  }
  render();
  data = {'test':0};
  var options = {
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify(data)
  };
  console.log("Here");
  var urlToGo = '/reset';
  fetch(urlToGo,options);
  
}

function toggleCamera() {
  const camera = document.getElementById('camera');
  if (camera.style.display === 'none') {
    camera.style.display = 'block';
  } else {
    camera.style.display = 'none';
  }
}

const emojiElements = [];
// max emoji font size in px
const maxSize = 125;
const minSize = 40;
emojis.forEach((emoji, index) => {
  const node = document.createElement('div');
  node.style.fontSize = '0px';
  node.style.display = 'block';
  node.style.position = 'absolute';
  const top = Math.floor(Math.random() * (cloud.clientHeight / 2) + 20)
  const left = Math.floor(Math.random() * (cloud.clientWidth / 2) + (cloud.clientWidth / 4))
  node.style.top = `${top}px`;
  node.style.left = `${left}px`;
  node.textContent = emoji;
  cloud.appendChild(node);
  emojiElements.push(node);
});

function render() {
  const total = freqs.reduce((a, b) => a + b, 0);
  
  emojiElements.forEach((node, index) => {
    let size = total === 0 ? 0 : freqs[index]/total;
    const computedFontSize = Math.floor(size * maxSize);
    if (size === 0) {
      node.style.fontSize = '0px';
      // Or display display to none 
    } else if (computedFontSize > minSize) {
      node.style.fontSize = `${computedFontSize}px`;
    } else {
      node.style.fontSize = `${minSize}px`;
    }
    
    cloud.appendChild(node);
  });
}

render();



var gettingResponse = setInterval(callForUpdate, 2000);

const wordsToEmojis = ['😄','🤓','🙃','😞','😱', '😷'];


function callForUpdate() {

    const mainResponse = new XMLHttpRequest();
     // For All
    var urlValues='/allvalues';
    mainResponse.open("GET", urlValues);
    mainResponse.send();
    mainResponse.onreadystatechange = (e) => {
        var returned = mainResponse.responseText
        console.log("Returned values is")
        console.log(returned);
        if(returned.length == 0){
            return;
        }
        var obj = JSON.parse(returned)
        console.log("JSON IS");
        console.log(obj);
        var totalSmiling = obj['totalSmiling'];
        freqs[1] = parseInt(totalSmiling);//For Smile
        var totalConfused = obj['totalConfused'];
        freqs[2] = parseInt(totalConfused);//For Confused
        var totalThumbsUp = obj['totalThumbs'];
        freqs[4] = parseInt(totalThumbsUp);//For Thumbs UP
        var totalSurprised = obj['totalSurprised'];
        freqs[3] = parseInt(totalSurprised);//For Surprised

        var handRaisedList = obj['handRaised'];
        var emotionList = obj['emotions'];

        if(handRaisedList.length > 0){
            var str = "<ul>";
            handRaisedList.forEach(function(name) {
                str += '<p>✋ '+name+'</p>';
            }); 
            str+="</ul>"
            $('#peopleHandRaised').html(str);
            freqs[0] = handRaisedList.length;
        }
        

        if(emotionList.length > 0){
            var str = ""
            for (var i =0;i<emotionList.length;i++){
                if(emotionList[i]!=0){
                    str+=`<div class="emotion"><p>${wordsToEmojis[i]}</p><span>${emotionList[i]}</span></div>`;
                }
            }
            var emotionsWrapper = $("#class-emotions");
            emotionsWrapper.html(str);
        }
        
    }


    // const HandRaised = new XMLHttpRequest();

    // For surprised
    // var urlHandRaised='/handraise/test/0';
    // HandRaised.open("GET", urlHandRaised);
    // HandRaised.send();
    // HandRaised.onreadystatechange = (e) => {
    //     var response = HandRaised.responseText;
    //     if(response.length >2){
    //         var handRaiseList = JSON.parse(response);
    //         var str = "<ul>";
    //         handRaiseList.forEach(function(name) {
    //             str += '<p>✋ '+name+'</p>';
    //         }); 
    //         str+="</ul>"
    //         $('#peopleHandRaised').html(str);
    //         freqs[0] = handRaiseList.length;
    //     }
        
    // }

    // const HttpEmotion = new XMLHttpRequest();

    // For surprised
    // var urlEmotion='/getemotion';
    // HttpEmotion.open("GET", urlEmotion);
    // HttpEmotion.send();
    // HttpEmotion.onreadystatechange = (e) => {
    //     var response = HttpEmotion.responseText;
    //     if(response.length > 2){
    //         var emotionList = JSON.parse(response);
    //         var str = ""
    //         for (var i =0;i<emotionList.length;i++){
    //             if(emotionList[i]!=0){
    //                 str+=`<div class="emotion"><p>${wordsToEmojis[i]}</p><span>${emotionList[i]}</span></div>`;
    //             }
    //         }
    //         var emotionsWrapper = $("#class-emotions");
    //         emotionsWrapper.html(str);
    //     }
       
    //     // emotionsWrapper.html(str);
    // }
    render();
}




socket.on('updateEmotions', function(emotions) {
  
  let emotionsMap = {};
  Object.keys(emotions).forEach(user => {
    let val = emotions[user];
    if (Object.keys(emotionsMap).includes(val)) {
      emotionsMap[val] += 1;
    } else {
      emotionsMap[val] = 1;
    }
  });

  const emotionsWrapper = document.getElementById('class-emotions');
  emotionsWrapper.innerHTML = '';
  Object.keys(emotionsMap).forEach(emotion => {
    if (emotion !== undefined && wordsToEmojis[emotion] !== undefined) {
      let htmlContent = `<div class="emotion"><p>${wordsToEmojis[emotion]}</p><span>${emotionsMap[emotion]}</span></div>`;
      emotionsWrapper.innerHTML += htmlContent;
    }
  });
});

window.setInterval(function() {
  freqs[5] = 0;
  freqs[6] = 0;
}, 5000);


