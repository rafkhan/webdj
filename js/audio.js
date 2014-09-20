/* global console,Q */

window.AudioContext = window.AudioContext || window.webkitAudioContext;

(function(_audio) {
  'use strict';

  _audio.context = new AudioContext();

  _audio.merger = _audio.context.createChannelMerger(2);
  _audio.merger.connect(_audio.context.destination);

  var deck = {
    A: null,
    B: null
  };

  _audio.load = function(deckName, track) {
    var src = _audio.context.createBufferSource();
    src.buffer = track.buffer;
    track.src = src;
    deck[deckName] = track;
  };

  _audio.play = function(deckName) {
    deck[deckName].src.start(0);
  };

})(window.audioManager = window.audioManager || {});

