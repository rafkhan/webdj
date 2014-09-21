(function(_track) {
  'use strict';
  
  _track.list = [];

  _track.playOnDeck = function(deck, i) {
    var reader = new FileReader();
    var newTrack = track.list[i]
    reader.onload = (function(e) {
      newTrack.context.decodeAudioData(reader.result, function(audioBuffer) {
        newTrack.buffer = audioBuffer;
        newTrack.offset = 0;
        audioManager.load(deck, newTrack);
      });
    });
    reader.readAsArrayBuffer(newTrack.file);
  }

  _track.add = function(context, file) {
    function generateDeckButton(deck, index) {
      return '<input type="button" value="Load on '+deck+
        '" onclick="javascript:track.playOnDeck(\''+deck+'\', \''+index+'\');" />';
    }

    var newTrack = {};
    newTrack.file = file;
    newTrack.context = context;
    id3(file, function(err, tags) {
      if (err) {
        newTrack.err = err;
      }
      newTrack.tags = tags;
      var trackIndex = _track.list.push(newTrack) - 1;
      var newRow = document.getElementById("track-table").insertRow();
      if (!err) {
        var newCell = newRow.insertCell();
        newCell.innerHTML = newTrack.tags["title"];
        newCell = newRow.insertCell();
        newCell.innerHTML = newTrack.tags["album"];
        newCell = newRow.insertCell();
        newCell.innerHTML = newTrack.tags["artist"];
        newCell = newRow.insertCell();
        newCell.innerHTML = generateDeckButton('deckA', trackIndex) + generateDeckButton('deckB', trackIndex);
      }
    });
  }
})(window.track = window.track || {});
