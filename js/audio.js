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

  function freshSource(song) {
    song.src.stop();
    song.src.disconnect();

    song.src = _audio.context.createBufferSource();
    song.src.buffer = song.buffer;
    song.src.connect(song.nodeChain[1]);
  }

  _audio.load = function(deckName, song) {
    song.src = _audio.context.createBufferSource();
    song.src.buffer = song.buffer;
    song.nodeChain = [];
    song.nodeChain.push(song.src);

    var deckGain = _audio.context.createGain();
    song.nodeChain.push(deckGain);
    deckGain.gain.value = 1.0;

    var xfadeGain = _audio.context.createGain();
    song.nodeChain.push(xfadeGain);

    song.nodeChain.push(_audio.merger);

    for (var i=1;i<song.nodeChain.length;i++) {
      song.nodeChain[i-1].connect(song.nodeChain[i]);
    }

    deck[deckName] = song;

    var peaks;

    if(deckName === 'deckA') {
      deckAName.innerHTML = song.tags.title;
      deckAArtist.innerHTML = song.tags.artist;
      deckAAlbum.innerHTML = song.tags.album;
      deckACanvas.onclick = function(e) {
          var x;
          if (e.pageX)
              x = e.pageX - deckACanvas.offsetLeft;
          else
              x = e.x;
          console.log("clicked at pos "+e.x);
          _audio.seek('deckA', (x/deckACanvas.width)*song.buffer.duration);
      }
      peaks = getPeaks(song.buffer, 500);
      waveGrapher.draw(deckADrawCtx, peaks);
    } else if(deckName === 'deckB') {
      deckBName.innerHTML = song.tags.title;
      deckBArtist.innerHTML = song.tags.artist;
      deckBAlbum.innerHTML = song.tags.album;
      deckBCanvas.onclick = function(e) {
          var x = e.pageX;
          _audio.seek('deckB', (x/deckBCanvas.width)*song.buffer.duration);
      }
      peaks = getPeaks(song.buffer, 500);
      waveGrapher.draw(deckBDrawCtx, peaks);
    }

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
    song.src.start(song.offset);
  };

  _audio.updateDeckVolume = function(deck, val) {
    
  };

  _audio.crossFade = function(val) {
    var x = parseInt(val) / parseInt(127);
    // Use an equal-power crossfading curve:
    var gain1 = Math.cos(x * 0.5*Math.PI);
    var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);

    var songA = deck.deckA;
    var aLen  = songA.nodeChain.length;
    var songB = deck.deckB;
    var bLen  = songB.nodeChain.length;

    console.log('xfa', songA.nodeChain[aLen - 2]);
    console.log('xfb', songB.nodeChain[bLen - 2]);

    songA.nodeChain[aLen - 2].gain.value = gain2;
    songB.nodeChain[bLen - 2].gain.value = gain1;
  };

  // _audio.pause = function(deckName) {
  //     var song = deck[deckName];
  //     freshSource(song);
  // };

  _audio.stop = function(deckName) {
      var song = deck[deckName];
      freshSource(song);
  };

  _audio.seek = function(deckName, offset) {
      var song = deck[deckName];
      freshSource(song);
      var canvas = deckAVisCanvas;
      if (deckName === 'deckB')
          canvas = deckBVisCanvas;
      requestAnimationFrame(waveGrapher.getVisualizerCb(song, canvas));
      song.src.start(0, offset);
  }
  
})(window.audioManager = window.audioManager || {});

