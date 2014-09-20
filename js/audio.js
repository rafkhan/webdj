/* global console,Q */

window.AudioContext = window.AudioContext || window.webkitAudioContext;

(function(_audio) {
  'use strict';

  _audio.context = new AudioContext();

  _audio.merger = _audio.context.createChannelMerger(2);
  var dest = _audio.context.createMediaStreamDestination();
  _audio.merger.connect(dest);
  _audio.merger.connect(_audio.context.destination);
  rtc.connection.attachStreams.push(dest.stream);
    

  var deck = {};


  var deckAName;
  var deckAArtist;
  var deckAAlbum;

  var deckBName;
  var deckBArtist;
  var deckBAlbum;

  _audio.initUI = function() {
    console.log('x');
    deckAName = document.getElementById('deckAName');
    deckAArtist = document.getElementById('deckAArtist');
    deckAAlbum = document.getElementById('deckAAlbum');

    deckBName = document.getElementById('deckBName');
    deckBArtist = document.getElementById('deckBArtist');
    deckBAlbum = document.getElementById('deckBAlbum');
  };


  function getPeaks(buffer, length) {
    var sampleSize = buffer.length / length;
    var sampleStep = ~~(sampleSize / 10) || 1;
    var channels = buffer.numberOfChannels;
    var peaks = new Float32Array(length);

    for (var c = 0; c < channels; c++) {
        var chan = buffer.getChannelData(c);
        for (var i = 0; i < length; i++) {
            var start = ~~(i * sampleSize);
            var end = ~~(start + sampleSize);
            var max = 0;
            for (var j = start; j < end; j += sampleStep) {
                var value = chan[j];
                if (value > max) {
                    max = value;
                // faster than Math.abs
                } else if (-value > max) {
                    max = -value;
                }
            }
            if (c == 0 || max > peaks[i]) {
                peaks[i] = max;
            }
        }
    }

    return peaks;
  }



  _audio.load = function(deckName, song) {
    var src = _audio.context.createBufferSource();
    src.buffer = song.buffer;
    song.src = src;

    //TODO hook up effects and volume
    
    src.connect(_audio.merger);
    deck[deckName] = song;

    var peaks;

    if(deckName === 'deckA') {
      deckAName.innerHTML = song.tags.title;
      deckAArtist.innerHTML = song.tags.artist;
      deckAAlbum.innerHTML = song.tags.album;
      peaks = getPeaks(song.buffer, 500);
      debugger;
    } else if(deckName === 'deckB') {
      deckBName.innerHTML = song.tags.title;
      deckBArtist.innerHTML = song.tags.artist;
      deckBAlbum.innerHTML = song.tags.album;
      peaks = getPeaks(song.buffer, 500);
    }

  };

  _audio.play = function(deckName) {
    var song = deck[deckName];
        song.src.start(0);
  };

  
})(window.audioManager = window.audioManager || {});

