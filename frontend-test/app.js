const cloud = document.getElementById('cloud');

const emojis = [
  '🤓',
  '🙁',
  '😐',
  '😪',
  '🤗',
  '🤔'
];

const freqs = [
  (Math.random() * 200) + 10,
  (Math.random() * 200) + 10,
  (Math.random() * 200) + 10,
  (Math.random() * 200) + 10,
  (Math.random() * 200) + 10,
  (Math.random() * 200) + 10,
];

const total = freqs.reduce((a, b) => a + b, 0);

emojis.forEach((emoji, index) => {
  let locX = Math.floor(Math.random() * 55) + 25;
  let locY = Math.floor(Math.random() * 55) + 25;

  let size = freqs[index]/total * 100;
  const node = document.createElement('div');
  node.style.fontSize = `${size + 100}px`;
  node.style.position = 'fixed';
  node.style.display = 'block';
  node.style.top = `${locY}%`;
  node.style.left = `${locX}%`;
  node.textContent = emoji;
  cloud.appendChild(node);
})