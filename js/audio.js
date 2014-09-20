/* global console,Q */

window.AudioContext = window.AudioContext || window.webkitAudioContext;

(function(_audio) {
  'use strict';

  _audio.context = new AudioContext();

  _audio.merger = _audio.context.createChannelMerger(2);
  _audio.merger.connect(_audio.context.destination);
  connection.attachStreams.push(_audio.context.destination.stream);

  var deck = {};

  _audio.load = function(deckName, track) {
    var src = _audio.context.createBufferSource();
    src.buffer = track.buffer;
    track.src = src;
    //TODO hook up effects and volume
    src.connect(_audio.merger);
    deck[deckName] = track;
  };

  _audio.play = function(deckName) {
    deck[deckName].src.start(0);
  };

})(window.audioManager = window.audioManager || {});

