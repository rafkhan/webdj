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

    console.log('AYYY');

    function onKnobUpdate(key, knob, ev) {
      if(ev.data[1] === key) {
        mapping[knob](ev.data[2]);
      }
    }

    function onPiano(key, ev, cb) {
    
    }



    mpk.onmidimessage = function(ev) {
      console.log(ev.data);
      /*
      mapUpDown(44, 'pad1', ev);
      mapUpDown(45, 'pad2', ev);
      mapUpDown(46, 'pad3', ev);
      mapUpDown(47, 'pad4', ev);
      mapUpDown(48, 'pad5', ev);
      mapUpDown(49, 'pad6', ev);
      mapUpDown(50, 'pad7', ev);
      mapUpDown(51, 'pad8', ev);
      */

      mapUpDown(48, 'key1', ev);
      mapUpDown(50, 'key2', ev);
      mapUpDown(52, 'key3', ev);
      mapUpDown(53, 'key4', ev);
      mapUpDown(55, 'key5', ev);
      mapUpDown(57, 'key6', ev);
      mapUpDown(59, 'key7', ev);
      mapUpDown(60, 'key8', ev);

      onKnobUpdate(5, 'knob5', ev);
      onKnobUpdate(1, 'knob1', ev);

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

      console.log(ev.data[1]);

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
      if(ev.data[1] === 7) { mapping.rightVolume(ev); }
      if(ev.data[1] === 22) { mapping.leftVolume(ev); }
      
      if(ev.data[1] === 89) { mapping.padA0(ev); }
      if(ev.data[1] === 90) { mapping.padA1(ev); }
      if(ev.data[1] === 91) { mapping.padA2(ev); }
      if(ev.data[1] === 92) { mapping.padA3(ev); }
      if(ev.data[1] === 83) { mapping.padA4(ev); }
      if(ev.data[1] === 84) { mapping.padA5(ev); }
      if(ev.data[1] === 85) { mapping.padA6(ev); }
      if(ev.data[1] === 99) { mapping.padA7(ev); }

      if(ev.data[1] === 93) { mapping.padB0(ev); }
      if(ev.data[1] === 94) { mapping.padB1(ev); }
      if(ev.data[1] === 95) { mapping.padB2(ev); }
      if(ev.data[1] === 96) { mapping.padB3(ev); }
      if(ev.data[1] === 86) { mapping.padB4(ev); }
      if(ev.data[1] === 87) { mapping.padB5(ev); }
      if(ev.data[1] === 88) { mapping.padB6(ev); }
      if(ev.data[1] === 100) { mapping.padB7(ev); }

      
    };
  };  


  
})(window.midi = window.midi || {});
