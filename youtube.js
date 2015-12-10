var spawn = require('child_process').spawn;
var Promise = require('bluebird');
var ffmpeg = require('fluent-ffmpeg');
var path = require('path');

exports.getYouTubeAudio = function(videoId){
	return new Promise(function(resolve, reject){
      // Install youtube_dl locally: brew install youtube-dl
    youtube_dl = spawn('youtube-dl', ['--extract-audio', '--audio-format', 'mp3', '-o', 'file.%(ext)s', "http://www.youtube.com/watch?v=" + videoId]);

    youtube_dl.stdout.on('data', function(data){
      console.log(data.toString());
    });

    youtube_dl.stderr.on('data', function(data){
      process.stderr.write(data);
    });

    // brew install ffmpeg
    youtube_dl.on('exit', function(){
      var mp3File = path.join(__dirname, 'file.mp3');
      var flacFile = path.join(__dirname, 'file.flac')
      ffmpeg(mp3File)
        .output(flacFile)
        .on('end', function(){
          resolve();
        })
        .on('error', function(err){
          reject(err);
        })
        .run();
    });
  });
};
