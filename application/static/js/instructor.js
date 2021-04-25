const cloud = document.getElementById('cloud');

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
  socket.emit('reset');
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

socket.on('connect', function() {
  console.log('Receiving feedback!');
});

socket.on('raiseHandResponse', function(name, count, raisedValue) {
  $('.handRaisedList').css('display','flex');
  if(raisedValue){
    $('#peopleHandRaised').append('<p>✋ '+name+'</p>')
  }else{
    $("#peopleHandRaised p").each(function(){
      console.log($(this).text());
      if($(this).text() === name){
        this.remove();
      }
    });
  }
  
  freqs[0] = count;
  render();
  console.log(name + 'raised their hand');
});

socket.on('smileResponse', function(count) {
  freqs[1] = count;
  render();
  console.log('smile detected!');
});

socket.on('confusedResponse', function(count) {
  freqs[2] = count;
  render();
  console.log('confuse detected!');
});

socket.on('surprisedResponse', function(count) {
  freqs[3] = count;
  render();
  console.log('surprised detected!');
});

socket.on('thumbsUpResponse', function(count) {
  freqs[4] = count;
  render();
  console.log('thumbs detected!');
});

socket.on('noResponse', function(count) {
  freqs[5] = count;
  render();
  console.log('no detected!');
});

socket.on('yesResponse', function(count) {
  freqs[6] = count;
  render();
  console.log('yes detected!');
});

socket.on('updateEmotions', function(emotions) {
  const wordsToEmojis = {
    'happy': '😄',
    'ready': '🤓',
    'notgreat': '🙃',
    'sad': '😞',
    'dying': '😱',
    'sick': '😷',
  };

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


