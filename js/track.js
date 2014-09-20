(function(_track) {
    'use strict';
    
    _track.list = [];

    _track.playOnDeck = function(deck, i) {
        audioManager.load(deck, track.list[i]);
    }

    _track.add = function(context, file) {
        function generateDeckButton(deck, index) {
            return '<input type="button" value="Load on '+deck+
                '" onclick="javascript:track.playOnDeck(\''+deck+'\', \''+index+'\');" />';
        }

        var reader = new FileReader();
        var newTrack = {};
        reader.onload = (function(e) {
            context.decodeAudioData(reader.result, function(audioBuffer) {
                newTrack.buffer = audioBuffer;
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
            });
        });
        reader.readAsArrayBuffer(file);
    }

})(window.track = window.track || {});
