var watson = require('watson-developer-cloud');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var speech_to_text = watson.speech_to_text({
  username: '505575e5-324c-45f6-b22e-751a23d6680d',
  password: 'UfEnWMLWZCuz',
  version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
});

exports.watsonSpeechToText = function(audioFile) {

  return new Promise(function(resolve, reject) {

    var params = {
      content_type: 'audio/flac',
      timestamps: true,
      continuous: true
    };

    var results = [];

    // create the stream
    var recognizeStream = speech_to_text.createRecognizeStream(params);

    // pipe in some audio
    fs.createReadStream(audioFile).pipe(recognizeStream);

    // listen for 'data' events for just the final text
    // listen for 'results' events to get the raw JSON with interim results, timings, etc.

    recognizeStream.setEncoding('utf8'); // to get strings instead of Buffers from `data` events

    recognizeStream.on('results', function(e) {
      if (e.results[0].final) {
        results.push(e);
      }
    });

    ['data', 'results', 'error', 'connection-close'].forEach(function(eventName) {
      recognizeStream.on(eventName, console.log.bind(console, eventName + ' event: '));
    });

    recognizeStream.on('error', function(err) {
      util.handleError('Error writing to transcript.json: ' + err);
    });

    recognizeStream.on('connection-close', function() {
    	var transcriptFile = path.join(__dirname, 'transcript.json');

      fs.writeFile(transcriptFile, JSON.stringify(results), function(err) {
        if (err) {
          util.handleError(err);
        }
        resolve();
      });
    });
  });
};