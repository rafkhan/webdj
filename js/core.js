/* global _,console,midi,track,audioManager */

window.onload = function() {
  'use strict';

    var audioManager = {};
    audioManager.context = new AudioContext();

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
      console.log(deviceMap);
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

      /*
      var mixtrack = deviceMap['MixTrack II'];
      midi.makeMixtrackMappings(mixtrack, {
        pad1: function(ev) {
        
        }
      });
      */
    }, console.log);


  var mixerDiv = document.getElementById('mixerBoardContainer');
  var deckB = document.getElementById('deckB');

  window.mixerDiv = mixerDiv;
  
  function resize() {
    var pageWidth = document.clientWidth;
    var rightBound = deckB.offsetLeft;
    mixerDiv.style.width = (rightBound - 500) + 'px';
    mixerDiv.style.left = 500;
    mixerDiv.style.backgroundColor = 'black';
  }

  // RESIZE MIXER
  window.onresize = resize;
  resize();
};
