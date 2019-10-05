const express = require('express');
const _ = require('lodash');
const RPIPlayer = require('./rpi-player').RPIPlayer;

const KIDS_RADIO_SERVER_URL = process.env.KIDS_RADIO_SERVER_URL;

if (_.isNil(KIDS_RADIO_SERVER_URL)) {
  console.log(`Your kids radio server is not set. Please set env var: KIDS_RADIO_SERVER_JSON_URL`);
} else {
  RPIPlayer.setUrl(KIDS_RADIO_SERVER_URL);
  RPIPlayer.downloadList()
    .then(() => {
      RPIPlayer.syncFilesWithList()
        .then(() => {
          console.log('synced========');
        })
        .catch(console.error);
    })
    .catch(console.error);
}

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

  listenPin(27, (delta) => {
    RPIPlayer.previous();
  });
  listenPin(22, () => {
    RPIPlayer.stop();
  });
  listenPin(17, () => {
    RPIPlayer.play();
  });
  listenPin(26, () => {
    RPIPlayer.next();
  });

} catch (err) {
  console.log('wiring pi error, probably running NOT on rpi hardware');
}

// Web Server
const PORT = 80;
const HOST = '0.0.0.0';

const app = express();
app.set('view engine', 'pug');
app.set('views', './views');
app.get('/', (req, res) => {
  res.render('index.pug', {title: 'Kids-Radio'});
});

app.get('/1', (req, res) => {
  RPIPlayer.previous();
  res.send(RPIPlayer.getCurrentFileObject());
});
app.get('/2', (req, res) => {
  RPIPlayer.stop();
  res.send('STOP');
});
app.get('/stop', (req, res) => {
  RPIPlayer.stop();
  res.send(`stopped`);
});
app.get('/3', (req, res) => {
  RPIPlayer.play();
  res.send('PLAY');
});
app.get('/4', (req, res) => {
  RPIPlayer.next();
  res.send(RPIPlayer.getCurrentFileObject());
});
app.get('/url/:url', (req, res) => {
  const url = req.params.url;
  RPIPlayer.play(url);
  res.send(`playing ${url}`);
});

app.listen(PORT, HOST);
RPIPlayer.playFile('./assets/radio_bereit.mp3');
console.log(`Running on http://${HOST}:${PORT}`);
