const express = require('express');
const pipins = require('pi-pins');

const player = require('play-sound')(opts = {
  player: 'mpg123',
});

const button_prev = pipins.connect(17);
button_prev.mode('in');
const button_stop = pipins.connect(27);
button_stop.mode('in');
const button_play = pipins.connect(22);
button_play.mode('in');
const button_next = pipins.connect(26);
button_next.mode('in');

// Constants
const PORT = 80;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.get('/1', (req, res) => {
  player.play('./assets/1.mp3',() =>{});
  res.send('1');
});
app.get('/2', (req, res) => {
  player.play('./assets/2.mp3',() =>{});
  res.send('2');
});
app.get('/3', (req, res) => {
  player.play('./assets/3.mp3',() =>{});
  res.send('3');
});
app.get('/4', (req, res) => {
  player.play('./assets/4.mp3',() =>{});
  res.send('4');
});

app.listen(PORT, HOST);
player.play('./assets/radio_bereit.mp3',() =>{});
console.log(`Running on http://${HOST}:${PORT}`);

button_prev.on('fall', function () {       // rise, fall, both
  console.log("prev-1");
  player.play('./assets/1.mp3',() =>{});
});
button_stop.on('fall', function () {       // rise, fall, both
  console.log("stop-2");
  player.play('./assets/2.mp3',() =>{});
});
button_stop.on('fall', function () {       // rise, fall, both
  console.log("play-3");
  player.play('./assets/3.mp3',() =>{});
});
button_stop.on('fall', function () {       // rise, fall, both
  console.log("next-4");
  player.play('./assets/4.mp3',() =>{});
});
