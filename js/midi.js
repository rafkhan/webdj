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
})(window.midiDeviceLoader = window.midiDeviceLoader || {});
