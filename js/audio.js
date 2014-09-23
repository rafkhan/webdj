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
  _audio.deck = deck;

  var deckAName;
  var deckAArtist;
  var deckAAlbum;
  var deckAButton;

  var deckBName;
  var deckBArtist;
  var deckBAlbum;
  var deckBButton;

  var deckACanvas;
  var deckAVisCanvas;
  var deckADrawCtx;

  var deckBCanvas;
  var deckBVisCanvas;
  var deckBDrawCtx;

  _audio.initUI = function() {
    deckAName = document.getElementById('deckAName');
    deckAArtist = document.getElementById('deckAArtist');
    deckAAlbum = document.getElementById('deckAAlbum');
    deckAButton = document.getElementById('deckA-button');

    deckBName = document.getElementById('deckBName');
    deckBArtist = document.getElementById('deckBArtist');
    deckBAlbum = document.getElementById('deckBAlbum');
    deckBButton = document.getElementById('deckB-button');

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

  function freshSourceEvent(deckName) {
      return function(e) {
          song = deck[deckName];
          song.src.disconnect();
          if (song.queue) {
              var i = song.queue.shift();
              if (song.queue.length != 0)
                  track.list[i].queue = song.queue;
              track.playOnDeck(deckName, i);
              return;
          }
          song.src = _audio.context.createBufferSource();
          song.src.buffer = song.buffer;
          song.src.connect(song.nodeChain[1]);
      };
  }

  function freshSource(song) {
    if (!song.starttime)
        return;
    song.starttime = null;
    song.src.stop();
    song.src.disconnect();

    song.src = _audio.context.createBufferSource();
    song.src.buffer = song.buffer;
    song.src.connect(song.nodeChain[1]);
  }

  _audio.load = function(deckName, song) {
    song.src = _audio.context.createBufferSource();
    song.src.onended = freshSourceEvent(deckName);
    song.src.buffer = song.buffer;
    song.nodeChain = [];
    song.nodeChain.push(song.src);

    _audio.lmax = _audio.context.sampleRate / 2;
    var lowpass = _audio.context.createBiquadFilter();
    lowpass.type = 0;
    lowpass.frequency.value = _audio.lmax;
    song.nodeChain.push(lowpass);

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
          _audio.seek('deckA', (x/deckACanvas.width)*song.buffer.duration);
      }
      peaks = getPeaks(song.buffer, 500);
      waveGrapher.draw(deckADrawCtx, peaks);
    } else if(deckName === 'deckB') {
      deckBName.innerHTML = song.tags.title;
      deckBArtist.innerHTML = song.tags.artist;
      deckBAlbum.innerHTML = song.tags.album;
      deckBCanvas.onclick = function(e) {
       var x;
          if (e.pageX)
              x = e.pageX - deckBCanvas.offsetLeft;
          else
              x = e.x;
          _audio.seek('deckA', (x/deckBCanvas.width)*song.buffer.duration);
      }
      peaks = getPeaks(song.buffer, 500);
      waveGrapher.draw(deckBDrawCtx, peaks);
    }

  };

  function pauseEvent(deckName) {
      return function(e) {
          _audio.pause(deckName);
      }
  }

  function playEvent(deckName) {
      return function(e) {
          _audio.play(deckName);
      }
  }

  _audio.play = function(deckName, reqAnim) {
    var song = deck[deckName];
    if (song == undefined) return;

    var canvas;
    var button;
    if(deckName === 'deckA') {
      canvas = deckAVisCanvas;
      button = deckAButton;
    } else if(deckName === 'deckB') {
      canvas = deckBVisCanvas;
      button = deckBButton;
    }

    button.value = "&#9208;";
    button.onclick = pauseEvent(deckName);

    if(!reqAnim) {
      requestAnimationFrame(waveGrapher.getVisualizerCb(song.nodeChain[song.nodeChain.length - 2], canvas));
    }

    song.starttime = new Date(((new Date().getTime()/1000) - song.offset)*1000);
    rtc.connection.send({
        deck: deckName,
        title: song.tags.title,
        artist: song.tags.artist
    });
    song.src.start(0, song.offset);
  };

  _audio.crossFade = function(val) {
    var x = val / 127;
    // Use an equal-power crossfading curve:
    var gain1 = Math.cos(x * 0.5*Math.PI);
    var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);

    var songA = deck.deckA;
    var aLen, bLen;
    if (songA !== undefined) {
      aLen = songA.nodeChain.length;
    }

    var songB = deck.deckB;
    if (songB !== undefined) {
      bLen  = songB.nodeChain.length;
    }

    if (songA !== undefined) {
      songA.nodeChain[aLen - 2].gain.value = gain2;
    }

    if (songB !== undefined) {
      songB.nodeChain[bLen - 2].gain.value = gain1;
    }
  };

  _audio.pause = function(deckName) {
    var song = deck[deckName];
    if (!song.starttime) return;
    song.offset = (new Date().getTime() - song.starttime.getTime()) / 1000;

    var button;
    if(deckName === 'deckA') {
      button = deckAButton;
    } else if(deckName === 'deckB') {
      button = deckBButton;
    }

    button.value = "&#9654;";
    button.onclick = playEvent(deckName);

    freshSource(song);
    rtc.connection.send({
      deck: deckName,
      paused: true
    })
  };
  
  _audio.adjustVolume = function(deckName, val) {
    var song = deck[deckName];
    if (song == undefined) return;
    song.nodeChain[song.nodeChain.length - 3]
      .gain.value = val / 127;
  };


  _audio.stop = function(deckName) {
      var song = deck[deckName];
      song.offset = 0;
      freshSource(song);
  };

  _audio.seek = function(deckName, offset) {
      var song = deck[deckName];
      if (song == undefined) return;
      freshSource(song);

      song.starttime = new Date(((new Date().getTime()/1000) - offset)*1000);
      song.src.start(0, offset);
  };
  
  _audio.setCue = function(deckName, index) {
      var song = deck[deckName];

      if (song.starttime)
          song.cues[index] = ((new Date().getTime() - song.starttime.getTime())/1000);
      else
          song.cues[index] = song.offset;
      return false;
  };

  _audio.getCue = function(deckName, index) {
    if (deck[deckName] == undefined) return null;
    deck[deckName].cues = deck[deckName].cues ||
        [null, null, null, null, null, null, null, null];

    return deck[deckName].cues[index] ?
      deck[deckName].cues[index] : _audio.setCue(deckName, index);
  };

  _audio.removeCue = function(deckName, index) {
      deck[deckName].cues[index] = null;
  };

  _audio.lowPass = function(deckName, val) {
    var song = deck[deckName];
    if (song === undefined) return;
    song.nodeChain[song.nodeChain.length - 4]
      .frequency.value = (val / 127) * _audio.lmax;

  };

  _audio.turntable = function(deckName, direction) {
    /*
      var add = -60;
      if (direction == 'clock') {
        add = 60;
      }
      _audio.pause(deckName);
      deck[deckName].offset += add;
      _audio.play(deckName, true);
      */
  };

})(window.audioManager = window.audioManager || {});

