/* global _,console,midiDeviceLoader */

window.onload = function() {
  'use strict';

  midiDeviceLoader.getDevices()
    .then(function(devices) {
      console.log(devices);
      _.forEach(devices, function(md) {
        console.log(md);
        md[1].onmidimessage = function(ev) {
          console.log(ev);
          console.log('ayy');
        };
      });
    });
};
