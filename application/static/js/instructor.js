const cloud = document.getElementById('cloud');

const emojis = [
  '✋', // hand raised
  '😀', // smile
  '🤔', // confused
];

const freqs = [
  0,
  0,
  0,
];

function handleChoice() {
  console.log('something'); // eslint-disable-line
}

function render() {
  console.log(freqs); // eslint-disable-line
  const total = freqs.reduce((a, b) => a + b, 0);

  let child = cloud.lastElementChild; 
  while (child) {
      cloud.removeChild(child);
      child = cloud.lastElementChild;
  }

  emojis.forEach((emoji, index) => {
    let locX = Math.floor(Math.random() * 55) + 25;
    let locY = Math.floor(Math.random() * 55) + 25;
  
    let size = freqs[index]/total * 100;
    const node = document.createElement('div');
    node.style.fontSize = `${size + 60}px`;
    node.style.display = 'block';
    node.textContent = emoji;
    cloud.appendChild(node);
  });
}


render();

let namespace = "/web";

const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
socket.on('connect', function() {
  console.log('Connected!');
});


socket.on('raiseHandResponse', function(newHandRaiseCount) {
  freqs[0] = newHandRaiseCount;
  render();
  console.log('hand raise detected!');
});

socket.on('smileResponse', function(newSmileCount) {
  freqs[1] = newSmileCount;
  render();
  console.log('smile detected!');
});

socket.on('confuseResponse', function(newConfuseCount) {
  freqs[2] = newConfuseCount;
  render();
  console.log('confuse detected!');
});
