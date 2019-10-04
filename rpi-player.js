const _ = require('lodash');
const player = require('play-sound')(opts = {
  player: 'mpg123',
});

class RpiPlayer {
  constructor() {
    this.audio;
    this.files = [];
    this.currentSong = 0;
  }

  setFiles(files) {
    this.files = files;
  }

  play() {
    console.log('RPIPlayer play');
    this.audio = player.play(this.files[this.currentSong], err => console.error);
  }

  playFile(file) {
    console.log('RPIPlayer playFile', file);
    this.audio = player.play(file, err => console.error)
  }

  stop() {
    console.log('RPIPlayer stop');
    if (!_.isNil(this.audio)) {
      this.audio.kill();
    }
  }

  previous() {
    this.currentSong--;
    console.log('RPIPlayer previous', this.getCurrentFile());
  }

  next() {
    this.currentSong++;
    console.log('RPIPlayer next', this.getCurrentFile());
  }

  getCurrentFile() {
    return this.files[this.currentSong];
  }
}

module.exports.RPIPlayer = new RpiPlayer();
