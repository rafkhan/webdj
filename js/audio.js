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

  var deckACanvas;
  var deckAVisCanvas;
  var deckADrawCtx;

  var deckBCanvas;
  var deckBVisCanvas;
  var deckBDrawCtx;

  var nodeChain = [];

  _audio.initUI = function() {
    console.log('x');
    deckAName = document.getElementById('deckAName');
    deckAArtist = document.getElementById('deckAArtist');
    deckAAlbum = document.getElementById('deckAAlbum');

    deckBName = document.getElementById('deckBName');
    deckBArtist = document.getElementById('deckBArtist');
    deckBAlbum = document.getElementById('deckBAlbum');

    deckACanvas = document.getElementById('deckACanvas');
    deckADrawCtx = deckACanvas.getContext('2d');

    deckBCanvas = document.getElementById('deckBCanvas');
    deckBDrawCtx = deckBCanvas.getContext('2d');

    deckAVisCanvas = document.getElementById('deckAVisCanvas');
    deckBVisCanvas = document.getElementById('deckBVisCanvas');
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


    var masterGain = _audio.context.createGain();
    masterGain.connect(_audio.merger);
    src.connect(masterGain);

    masterGain.gain.value = 1.0;


    deck[deckName] = song;

    var peaks;

    if(deckName === 'deckA') {
      deckAName.innerHTML = song.tags.title;
      deckAArtist.innerHTML = song.tags.artist;
      deckAAlbum.innerHTML = song.tags.album;
      peaks = getPeaks(song.buffer, 500);
      waveGrapher.draw(deckADrawCtx, peaks);
    } else if(deckName === 'deckB') {
      deckBName.innerHTML = song.tags.title;
      deckBArtist.innerHTML = song.tags.artist;
      deckBAlbum.innerHTML = song.tags.album;
      peaks = getPeaks(song.buffer, 500);
      waveGrapher.draw(deckBDrawCtx, peaks);
    }

    debugger;
  };

  _audio.play = function(deckName) {
    var song = deck[deckName];

    var canvas;
    if(deckName === 'deckA') {
      canvas = deckAVisCanvas;
    } else if(deckName === 'deckB') {
      canvas = deckBVisCanvas;
    }

    requestAnimationFrame(waveGrapher.getVisualizerCb(song, canvas));
    song.src.start(0);
  };


  _audio.updateDeckVolume = function(deck, val) {
    
  };

  _audio.crossFade = function(val) {
    var x = parseInt(val) / parseInt(127);
    // Use an equal-power crossfading curve:
    var gain1 = Math.cos(x * 0.5*Math.PI);
    var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
    this.ctl1.gainNode.gain.value = gain1;
    this.ctl2.gainNode.gain.value = gain2;
  };

  
})(window.audioManager = window.audioManager || {});

