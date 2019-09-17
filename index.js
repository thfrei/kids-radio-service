const express = require('express');

// Constants
const PORT = 80;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

const player = require('play-sound')(opts = {
  player: 'mpg123',
});
//
// // $ mplayer foo.mp3
// player.play('foo.mp3', function(err){
//   if (err) throw err
// })
//
// // { timeout: 300 } will be passed to child process
// player.play('foo.mp3', { timeout: 300 }, function(err){
//   if (err) throw err
// })
//
// // configure arguments for executable if any
// player.play('foo.mp3', { afplay: ['-v', 1 ] /* lower volume for afplay on OSX */ }, function(err){
//   if (err) throw err
// })

// access the node child_process in case you need to kill it on demand
function main() {
  console.log('Play...: "Benjamin Blümchen./"');
  const audio = player.play('./sample.mp3', function(err){
    if (err && !err.killed) throw err
  });
  setTimeout(() => {
    audio.kill();
    }
  , 2000);
  // play.sound('./../_temp-kids-radio-files/6 - Benjamin Bluemchen und die Schule INFO.mp3');
}

// setInterval(main, 3000);
main();
