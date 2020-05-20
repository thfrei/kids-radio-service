const _ = require('lodash');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const sha256File = require('sha256-file');
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

  /**
   * Helper function for fetch
   * @param res
   * @returns {{ok}|*}
   */
  checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
      return res;
    } else {
      throw new Error(`HTTP Error: ${res.statusText}`);
    }
  }

  /**
   * Downloads a file
   *
   * Source: https://github.com/node-fetch/node-fetch/issues/375#issuecomment-385751664
   * @param filePath
   * @param url
   * @returns {Promise<void>}
   */
  async downloadFile(filePath, url) {
    /* Using Promises so that we can use the ASYNC AWAIT syntax */
    try {
      const res = await fetch(url);
      await new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(filePath);
        res.body.pipe(fileStream);
        res.body.on("error", (err) => {
          reject(err);
        });
        fileStream.on("finish", function () {
          resolve();
        });
      });
    } catch (err) {
      console.log('err, in downloadfile', err);
    }
  }

  downloadList() {
    return this.downloadFile(this.createFilePath(this.listFileName), `${this.serverUrl}${this.listFileName}`)
      .then(() => {})
      .catch(console.error);
  }

  loadList() {
    const listFilePath = this.createFilePath(this.listFileName);
    const listFile = fs.existsSync(listFilePath);
    if(listFile) {
      const list = require(listFilePath);
      this.setFiles(list);
    }
  }

  async syncFilesWithList() {
    try {
      const listFilePath = this.createFilePath(this.listFileName);
      const listFile = fs.existsSync(listFilePath);
      if(listFile) {
        const listRaw = fs.readFileSync(listFilePath);
        const list = JSON.parse(listRaw);
        this.setFiles(list);
        let i = 1;
        for (let entry of list) {
          console.log(`* === ${i}/${list.length} === working on ${entry.song.file} =====================`);
          await this.syncFileObject(entry.info);
          await this.syncFileObject(entry.song);
          i++;
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
      console.log('comparing sha', songFilePath, "\n", songSha, "\n", songListSha);
      if (songSha === songListSha) {
        // do nothing
        console.log('exact match of file exists locally already, skip download');
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
    this.stop();
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
    if (this.currentSong > this.files.length-1) {
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
