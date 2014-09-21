/* global _,console,midi,track,audioManager */

window.onload = function() {
  'use strict';

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
        pad1: {
          up: function(ev) { console.log('1up'); },
          down: function(ev) { console.log('1down'); },
        },

        pad2: {
          up: function(ev) { console.log('2up'); },
          down: function(ev) { console.log('2down'); },
        },

        pad3: {
          up: function(ev) { console.log('3up'); },
          down: function(ev) { console.log('3down'); },
        },

        pad4: {
          up: function(ev) { console.log('4up'); },
          down: function(ev) { console.log('4down'); },
        },

        pad5: {
          up: function(ev) { console.log('5up'); },
          down: function(ev) { console.log('5down'); },
        },

        pad6: {
          up: function(ev) { console.log('6up'); },
          down: function(ev) { console.log('6down'); },
        },

        pad7: {
          up: function(ev) { console.log('7up'); },
          down: function(ev) { console.log('7down'); },
        },

        pad8: {
          up: function(ev) { console.log('8up'); },
          down: function(ev) { console.log('8down'); },
        },

        knob5: function(x) { console.log(x); }
      });

      var mixtrack = deviceMap['MixTrack II'];
      midi.makeMixtrackMappings(mixtrack, {
        tableLeft: {
          clock: function(ev) { console.log('clockwise');},
          counter: function(ev) { console.log('counter clockwise');}
        },

        tableRight: {
          clock: function(ev) { console.log('clockwise');},
          counter: function(ev) { console.log('counter clockwise');}
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
          var offset;
          if (shiftIsDown)
            audioManager.removeCue(deckName, index);
          else if ((offset = audioManager.getCue(deckName, index)))
            audioManager.seek(deckName, offset);
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
