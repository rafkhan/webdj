(function(_waveGrapher) {
  'use strict';

  var W_HEIGHT = 150;
  var HEIGHT = 150;
  var WIDTH = 500;
  
  
  _waveGrapher.draw = function(ctx, peaks) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, W_HEIGHT);
    ctx.fillStyle = "#F00";
    
    var len = peaks.length;
    for(var i = 0; i < len; i++) {
      var height = HEIGHT * peaks[i];
      var top = HEIGHT - height;
      ctx.fillRect(i, top, 1, height);
    }
  };

  _waveGrapher.getVisualizerCb = function(song, canvas) {
    var HEIGHT = canvas.height;
    var WIDTH = canvas.width;
    var drawContext = canvas.getContext('2d');
    var analyser = audioManager.context.createAnalyser();
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);

    song.connect(analyser);

    //TODO kill
    var draw = function() {
      drawContext.fillStyle = "#000";
      drawContext.fillRect(0, 0, WIDTH, HEIGHT);

      analyser.getByteFrequencyData(freqDomain);
      for (var i = 0; i < analyser.frequencyBinCount; i++) {
        var value = freqDomain[i];
        var percent = value / 256;
        var height = HEIGHT * percent;
        var offset = HEIGHT - height - 1;
        var barWidth = WIDTH/analyser.frequencyBinCount;
        var hue = i/analyser.frequencyBinCount * 360;

        drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        drawContext.fillRect(i * barWidth, offset, barWidth, height);
      }

      requestAnimationFrame(draw);
    };

    return draw;
  };

})(window.waveGrapher = window.waveGrapher || {});

