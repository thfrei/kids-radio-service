const express = require('express');
const player = require('play-sound')(opts = {
  player: 'mpg123',
});
const _ = require('lodash');
try {
  const wpi = require('node-wiring-pi');
  wpi.setup('gpio');

  function listenPin(nr, cb) {
    wpi.pinMode(nr, wpi.INPUT);
    wpi.pullUpDnControl(nr, wpi.PUD_UP);
    let edges = {rising: false, falling: false};

    const debouncedCB = _.debounce(cb, 600);
    wpi.wiringPiISR(nr, wpi.INT_EDGE_RISING, function(delta) {
      console.log("both action on pin", nr, 'delta', delta);
      // only executes if delta >1k // <1k some spikes in electronics?
      if (delta > 1000) {
        debouncedCB(delta);
        console.log('exe 1');
      }
    });
  }

  listenPin(27, (delta) => {
    console.log('play asset');
    player.play('./assets/1.mp3',() =>{});
  });
  listenPin(22, () => {
    console.log('play asset');
    player.play('./assets/2.mp3',() =>{});
  });
  listenPin(17, () => {
    console.log('play asset');
    player.play('./assets/3.mp3',() =>{});
  });
  listenPin(26, () => {
    console.log('play asset');
    player.play('./assets/4.mp3',() =>{});
  });

} catch (err) {
  console.log('wiring pi error, probably running NOT on rpi hardware', err);
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
