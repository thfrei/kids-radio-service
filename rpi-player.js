const _ = require('lodash');
const request = require('request');
const path = require('path');
const fs = require('fs');
const sha256File = require('sha256-file');
const ProgressBar = require('./progress-bar');
const player = require('play-sound')(opts = {
  player: 'mpg123',
});

const DATA_STORAGE_PATH = process.env.DATA_STORAGE_PATH || '/data';
if (_.isNil(process.env.DATA_STORAGE_PATH)) {
  console.log(`env var DATA_STORAGE_PATH is not set. Using default: '/data'`);
}

class RpiPlayer {
  constructor() {
    this.audioHandles = [];
    this.files = [];
    this.currentSong = 0;
    this.serverUrl = '';

    this.listFileName = 'list.json';
  }

  setUrl(url) {
    this.serverUrl = url;
  }

  setFiles(files) {
    this.files = files;
  }

  async downloadFile(filePath, url) {
    /* source: https://learnscraping.com/how-to-download-files-with-nodejs-using-request/ */
    /* Create an empty file where we can save data */
    let file = fs.createWriteStream(filePath);
    /* Using Promises so that we can use the ASYNC AWAIT syntax */
    await new Promise((resolve, reject) => {
      let stream = request({
        /* Here you should specify the exact link to the file you are trying to download */
        uri: url,
        headers: {
          'Cache-Control': 'max-age=0',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
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

  downloadList() {
    return this.downloadFile(this.createFilePath(this.listFileName), `${this.serverUrl}${this.listFileName}`)
      .then(() => {})
      .catch(console.error);
  }

  async syncFilesWithList() {
    try {
      const listFilePath = this.createFilePath(this.listFileName);
      const listFile = fs.existsSync(listFilePath);
      if(listFile) {
        const list = require(listFilePath);
        for (let entry of list) {
          console.log(`working on ${entry.song.file} =====================`);
          await this.syncFileObject(entry.info);
          await this.syncFileObject(entry.song);
        }
        this.setFiles(list);
      }
    } catch (err) {
      console.error('sfwl', err);
    }
  }

  async syncFileObject(fileObject) {
    const songFilePath = this.createFilePath(fileObject.file);
    const songUrl = `${this.serverUrl}${fileObject.file}`;
    const songListSha = _.toString(fileObject.sha256).toUpperCase();

    if(fs.existsSync(songFilePath)) {
      // check if file exists
      const songSha = _.toString(sha256File(songFilePath)).toUpperCase();
      console.log('comparing sha', songFilePath, songSha, songListSha);
      if (songSha === songListSha) {
        // do nothing
        console.log('exact match of file exists locally already', songFilePath, songSha, songListSha);
      } else {
        // delete old file
        fs.unlinkSync(songFilePath);
        console.log('delete old file', songFilePath);
        console.log('downloading', songUrl, songFilePath);
        await this.downloadFile(songFilePath, songUrl);
      }
    } else {
      console.log('downloading', songFilePath);
      await this.downloadFile(songFilePath, songUrl);
    }
  }

  createFilePath(fileName) {
    return path.join(DATA_STORAGE_PATH, fileName);
  }

  play() {
    this.stop();
    console.log('RPIPlayer play');
    this.audioHandles.push(player.play(this.createFilePath(this.files[this.currentSong].song.file), err => console.error));
  }

  playInfo() {
    console.log('RPIPlayer play info');
    this.audioHandles.push(player.play(this.createFilePath(this.files[this.currentSong].info.file), err => console.error));
  }

  playFile(file) {
    console.log('RPIPlayer playFile', file);
    this.audioHandles.push(player.play(file, err => console.error));
  }

  stop() {
    console.log('RPIPlayer stop');
    for(let handle of this.audioHandles) {
      if (!_.isNil(handle)) {
        handle.kill();
      }
    }
  }

  previous() {
    this.currentSong--;
    if (this.currentSong<0) {
      this.currentSong=this.files.length-1;
    }
    this.playInfo();
    console.log('RPIPlayer previous', this.getCurrentFileObject());
  }

  next() {
    this.currentSong++;
    if (this.currentSong >= this.files.length-1) {
      this.currentSong = 0;
    }
    this.playInfo();
    console.log('RPIPlayer next', this.getCurrentFileObject());
  }

  getCurrentFileObject() {
    return this.files[this.currentSong].song.file;
  }
}

module.exports.RPIPlayer = new RpiPlayer();
