var connection = new RTCMultiConnection();
connection.firebase = "webdjrooms";

var roomid = window.location.pathname;
var firebaseURL = "https://" + connection.firebase + ".firebaseio.com";

var roomFirebase = new Firebase(firebaseURL + roomid.replace(".", ""));
roomFirebase.once('value', function(data) {
    var sessionDescription = data.val();
    if (sessionDescription == null) {
        connection.session = {
            audio: true,
            oneway: true
        };

        connection.dontCaptureUserMedia = true;

        var newSessionDescription = connection.open();
        roomFirebase.set(newSessionDescription);
        roomFirebase.onDisconnect().remove();
    } else {
        // var session = {};
        connection.session = {};
        connection.join(sessionDescription);
    }
});

function audioFileToBuffer(context, file) {
    var reader = new FileReader();
    var deferred = Q.defer();
    reader.onload = (function(e) {
        context.decodeAudioData(reader.result).then(
            function(audioBuffer) {
                deferred.resolve(audioBuffer);
            });
    });
    return deferred.promise;
}
