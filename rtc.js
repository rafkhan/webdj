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
	// connection.captureUserMedia(function (mediaStream) { }, session);
	var newSessionDescription = connection.open();
	roomFirebase.set(newSessionDescription);
	roomFirebase.onDisconnect().remove();
    } else {
	// var session = {};
	connection.session = {};
	connection.join(sessionDescription);
    }
});
