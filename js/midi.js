/* global console,Q */

(function(_midi) {
  'use strict';

  function getMidiSuccessCallback(deferred) {
    return function(midiAccess) {
      var inputMap = midiAccess.inputs;
      var inputEntries = inputMap.entries();

      var devices = [];

      while(true) {
        var entry = inputEntries.next();

        if(entry.done) {
          break;
        }

        devices.push(entry.value);
      }

      return deferred.resolve(devices); 
    };
  }


  _midi.getDevices = function() {
    var deferred = Q.defer();
    window.navigator.requestMIDIAccess().then(getMidiSuccessCallback(deferred),
        function() { console.log('Error requesting MIDI access'); });

    return deferred.promise;
  };


  _midi.makeMpkMappings = function(mpk, mapping) {
    function mapUpDown(key, pad, ev) {
      if(ev.data[1] === key) {
        if(ev.data[2] > 0) {
          mapping[pad].down(ev);
        } else {
          mapping[pad].up(ev);
        }
      }
    }

    function onKnobUpdate(key, knob, ev) {
      if(ev.data[1] === key) {
        mapping[knob](ev.data[2]);
      }
    }

    mpk.onmidimessage = function(ev) {
      mapUpDown(32, 'pad1', ev);
      mapUpDown(33, 'pad2', ev);
      mapUpDown(34, 'pad3', ev);
      mapUpDown(35, 'pad4', ev);
      mapUpDown(36, 'pad5', ev);
      mapUpDown(37, 'pad6', ev);
      mapUpDown(38, 'pad7', ev);
      mapUpDown(39, 'pad8', ev);

      onKnobUpdate(5, 'knob5', ev);
    };
  };

  
})(window.midi = window.midi || {});
