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

const emojiElements = [];
const sizeFactor = 45;
emojis.forEach((emoji, index) => {
  const node = document.createElement('div');
  node.style.fontSize = '16px';
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
  console.log(freqs); // eslint-disable-line
  const total = freqs.reduce((a, b) => a + b, 0);
  
  emojiElements.forEach((node, index) => {
    let size = freqs[index]/total * 100;
    node.style.fontSize = `${size + sizeFactor}px`;
    cloud.appendChild(node);
  });
}

render();

let namespace = "/web";

const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
socket.on('connect', function() {
  console.log('Connected!');
});


socket.on('raiseHandResponse', function(count) {
  freqs[0] = count;
  render();
  console.log('hand raise detected!');
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

socket.on('surpisedResponse', function(count) {
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

window.setInterval(function() {
  freqs[5] = 0;
  freqs[6] = 0;
}, 5000);
