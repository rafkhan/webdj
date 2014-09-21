/* global _,console,midi,track,audioManager */

window.onload = function() {
  'use strict';

  window.fordBuffers = [];

  audioManager.initUI();

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    for (var i = 0; i<files.length; i++) {
      track.add(audioManager.context, files[i]); 
    }
  }

  document.getElementById('files').
    addEventListener('change', handleFileSelect, false);

  function fordSample(idx) {
    return {
      up: function() {},
      down: function() {
        console.log('qwe');
        var src = audioManager.context.createBufferSource();
        src.buffer = fordBuffers[idx];
        src.connect(audioManager.merger);
        src.start(0);
      }
    };
  }

  midi.getDevices()
    .then(function(devices) {
      console.log(devices);
      var deviceMap = {};

      for(var i = 0; i < devices.length; i++) {
        var input = devices[i][1];
        deviceMap[input.name] = input;
      }

      return deviceMap;
    })
    .then(function(deviceMap) {
      var mpk = deviceMap.MPKmini2;
      midi.makeMpkMappings(mpk, {
        knob5: function(val) {
          audioManager.lowPass('deckB', val);
        },

        knob1: function(val) {
          audioManager.lowPass('deckA', val);
        },

        key1: fordSample(0),
        key2: fordSample(1)
      });

      var mixtrack = deviceMap['MixTrack II'];
      midi.makeMixtrackMappings(mixtrack, {
        tableLeft: {
          clock: function(ev) { audioManager.turntable('deckA', 'clock');},
          counter: function(ev) { audioManager.turntable('deckA', 'counter');}
        },

        tableRight: {
          clock: function(ev) { audioManager.turntable('deckB', 'clock');},
          counter: function(ev) { audioManager.turntable('deckB', 'counter');}
        },

        xFader: function(ev) {
          audioManager.crossFade(ev.data[2]);
        },

        rightVolume: function(ev) {
          audioManager.adjustVolume('deckB', ev.data[2]);
        },

        leftVolume: function(ev) {
          audioManager.adjustVolume('deckA', ev.data[2]);
        },

        padA0: makeCueHandler('deckA', 0),
        padA1: makeCueHandler('deckA', 1),
        padA2: makeCueHandler('deckA', 2),
        padA3: makeCueHandler('deckA', 3),
        padA4: makeCueHandler('deckA', 4),
        padA5: makeCueHandler('deckA', 5),
        padA6: makeCueHandler('deckA', 6),
        padA7: makeCueHandler('deckA', 7),

          
        padB0: makeCueHandler('deckB', 0),
        padB1: makeCueHandler('deckB', 1),
        padB2: makeCueHandler('deckB', 2),
        padB3: makeCueHandler('deckB', 3),
        padB4: makeCueHandler('deckB', 4),
        padB5: makeCueHandler('deckB', 5),
        padB6: makeCueHandler('deckB', 6),
        padB7: makeCueHandler('deckB', 7)

      });
    }, console.log);


  var mixerDiv = document.getElementById('mixerBoardContainer');
  var deckB = document.getElementById('deckB');
  var shiftIsDown = false;

  function makeCueHandler(deckName, index) {
    return function(ev) {
      if(ev.data[2] > 0) {
        var offset;
        if (shiftIsDown)
          audioManager.removeCue(deckName, index);
        else if ((offset = audioManager.getCue(deckName, index)))
          audioManager.seek(deckName, offset);
      }
    }
  }

  window.mixerDiv = mixerDiv;
  
  function resize() {
    var pageWidth = document.clientWidth;
    var rightBound = deckB.offsetLeft;
    mixerDiv.style.width = (rightBound - 500) + 'px';
    mixerDiv.style.left = 500;
  }

  // RESIZE MIXER
  window.onresize = resize;
};
