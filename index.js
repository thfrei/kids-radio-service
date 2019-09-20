const express = require('express');
const player = require('play-sound')(opts = {
  player: 'mpg123',
});

try {
  pipins = require('pi-pins');

  const button_prev = pipins.connect(17);
  button_prev.mode('in');
  const button_stop = pipins.connect(27);
  button_stop.mode('in');
  const button_play = pipins.connect(22);
  button_play.mode('in');
  const button_next = pipins.connect(26);
  button_next.mode('in');

  button_prev.on('fall', function () {       // rise, fall, both
    console.log("prev-1");
    printValues();
    player.play('./assets/1.mp3',() =>{});
  });
  button_stop.on('fall', function () {       // rise, fall, both
    console.log("stop-2");
    printValues();
    player.play('./assets/2.mp3',() =>{});
  });
  button_play.on('fall', function () {       // rise, fall, both
    console.log("play-3");
    printValues();
    player.play('./assets/3.mp3',() =>{});
  });
  button_next.on('fall', function () {       // rise, fall, both
    console.log("next-4");
    printValues();
    player.play('./assets/4.mp3',() =>{});
  });

  function printValues() {
    console.log('1', button_prev.value(), '2', button_stop.value(), '3', button_play.value(), '4', button_next.value());
  }
  setInterval(printValues, 2000);
} catch (err) {
  console.log('pipins error, probably running NOT on rpi hardware', err);
}

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
