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
      console.log(ev.data);
      mapUpDown(44, 'pad1', ev);
      mapUpDown(45, 'pad2', ev);
      mapUpDown(46, 'pad3', ev);
      mapUpDown(47, 'pad4', ev);
      mapUpDown(48, 'pad5', ev);
      mapUpDown(49, 'pad6', ev);
      mapUpDown(50, 'pad7', ev);
      mapUpDown(51, 'pad8', ev);

      onKnobUpdate(5, 'knob5', ev);
    };
  };

  
  _midi.makeMixtrackMappings = function(mixtrack, mapping) {
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

    mixtrack.onmidimessage = function(ev) {

      // TABLES
      if(ev.data[1] === 24) {
        if(ev.data[2] < 20) {
          mapping.tableRight.clock(ev);
        } else if(ev.data[2] > 110) {
          mapping.tableRight.counter(ev);
        }
      }

      if(ev.data[1] === 25) {
        if(ev.data[2] < 20) {
          mapping.tableLeft.clock(ev);
        } else if(ev.data[2] > 110) {
          mapping.tableLeft.counter(ev);
        }
      }

      // XFADER
      if(ev.data[1] === 10) { mapping.xFader(ev); }

    };
  };  


  
})(window.midi = window.midi || {});
