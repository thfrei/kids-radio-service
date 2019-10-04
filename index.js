const express = require('express');
const player = require('play-sound')(opts = {
  player: 'mpg123',
});
const _ = require('lodash');

const STATE = {
  currentSong: 0,
  files: [
    './assets/1.mp3',
    './assets/2.mp3',
    './assets/3.mp3',
    './assets/4.mp3',
    './assets/free_sample.mp3',
    './assets/radio_bereit.mp3',
    './assets/voice.mp3',
  ]
};

// GPIOs (Buttons)
try {
  const wpi = require('node-wiring-pi');
  wpi.setup('gpio');

  /**
   * listen to Pin
   * Pins:
   *  27 - previous
   *  22 - play
   *  17 - pause
   *  26 - next
   *
   *  @param nr
   *  @param <function> cb
   */
  function listenPin(nr, cb) {
    wpi.pinMode(nr, wpi.INPUT);
    wpi.pullUpDnControl(nr, wpi.PUD_UP);

    // execute cb on leading edge, do not execute in the next x ms even if called
    const debouncedCB = _.debounce(cb, 600, {
      'leading': true,
      'trailing': false
    });
    wpi.wiringPiISR(nr, wpi.INT_EDGE_RISING, function(delta) {
      console.log("rising action on pin", nr, 'delta', delta);
      // only executes if delta >1k // <1k some spikes in electronics?
      if (delta > 1000) {
        console.log('call debounced cb');
        debouncedCB(delta);
      }
    });
  }

  class RPIPlayer {
    constructor() {
      this.audio;
    }

    play() {
      console.log('RPIPlayer play', STATE);
      this.audio = player.play(STATE.files[STATE.currentSong], err => console.error);
    }

    stop() {
      console.log('RPIPlayer stop', STATE);
      if (!_.isNil(this.audio)) {
        this.audio.kill();
      }
    }

    previous() {
      console.log('RPIPlayer previous', STATE);
      STATE.currentSong--;
      console.log('RPIPlayer previous', STATE);
    }

    next() {
      console.log('RPIPlayer next', STATE);
      STATE.currentSong++;
      console.log('RPIPlayer next', STATE);
    }
  }
  const RPIAudio = new RPIPlayer();


  listenPin(27, (delta) => {
    RPIAudio.previous();
  });
  listenPin(22, () => {
    RPIAudio.stop();
  });
  listenPin(17, () => {
    RPIAudio.play();
  });
  listenPin(26, () => {
    RPIAudio.next();
  });

} catch (err) {
  console.log('wiring pi error, probably running NOT on rpi hardware', err);
}

// Web Server
const PORT = 80;
const HOST = '0.0.0.0';

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
let urlPlayer;
app.get('/url/:url', (req, res) => {
  const url = req.params.url;
  urlPlayer = player.play(url);
  res.send(`playing ${url}`);
});
app.get('/stop', (req, res) => {
  urlPlayer.kill();
  res.send(`stopped`);
});

app.listen(PORT, HOST);
player.play('./assets/radio_bereit.mp3',() =>{});
console.log(`Running on http://${HOST}:${PORT}`);
