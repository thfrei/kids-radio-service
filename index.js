var player = require('play-sound')(opts = {
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
var audio = player.play('./../_temp-kids-radio-files/6 - Benjamin Bluemchen und die Schule INFO.mp3', function(err){
  if (err && !err.killed) throw err
});
// audio.kill();
// play.sound('./../_temp-kids-radio-files/6 - Benjamin Bluemchen und die Schule INFO.mp3');
