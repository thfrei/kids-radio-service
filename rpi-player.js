const _ = require('lodash');
const request = require('request');
const path = require('path');
const fs = require('fs');
const player = require('play-sound')(opts = {
  player: 'mpg123',
});

const DATA_STORAGE_PATH = process.env.DATA_STORAGE_PATH || '/data';
if (_.isNil(process.env.DATA_STORAGE_PATH)) {
  console.log(`env var DATA_STORAGE_PATH is not set. Using default: '/data'`);
}

class RpiPlayer {
  constructor() {
    this.audio = undefined;
    this.files = [];
    this.currentSong = 0;
  }

  setFiles(files) {
    this.files = files;
  }

  async downloadFile(fileNameToSave, url) {
    /* source: https://learnscraping.com/how-to-download-files-with-nodejs-using-request/ */
    /* Create an empty file where we can save data */
    let file = fs.createWriteStream(path.join(DATA_STORAGE_PATH, fileNameToSave));
    /* Using Promises so that we can use the ASYNC AWAIT syntax */
    await new Promise((resolve, reject) => {
      let stream = request({
        /* Here you should specify the exact link to the file you are trying to download */
        uri: url,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
          'Cache-Control': 'max-age=0',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        },
        /* GZIP true for most of the websites now, disable it if you don't need it */
        gzip: true
      })
        .pipe(file)
        .on('finish', () => {
          console.log(`The file is finished downloading.`);
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        })
    })
    .catch(error => {
      console.log(`Something happened: ${error}`);
    });
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
