(function(_track) {
    'use strict';
    
    _track.list = [];

    _track.add = function(context, file) {
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
                    _track.list.push(newTrack);
                    var newRow = document.getElementById("track-table").insertRow();
                    if (!err)
                        for (var tag in newTrack.tags) {
                            var newCell = newRow.insertCell();
                            newCell.innerHTML = newTrack.tags[tag];
                        }
                });
            });
        });
        reader.readAsArrayBuffer(file);
    }

})(window.track = window.track || {});
