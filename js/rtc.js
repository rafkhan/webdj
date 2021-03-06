(function(_rtc) {

    _rtc.connection = new RTCMultiConnection();
    var connection = _rtc.connection;
    connection.firebase = "webdjrooms";

    var roomid = window.location.pathname.replace(".", "").replace("/", "");
    var firebaseURL = "https://" + connection.firebase + ".firebaseio.com/";

    var roomFirebase = new Firebase(firebaseURL + roomid);
    roomFirebase.once('value', function(data) {
        function addstream(e) {
            e.mediaElement.style.visibility = "none";
            document.body.appendChild(e.mediaElement);
        }

        var sessionDescription = data.val();
        if (sessionDescription == null) {
            connection.session = {
                audio: true,
                oneway: true
            };

            connection.dontCaptureUserMedia = true;

            var newSessionDescription = connection.open();
            document.getElementById("broadcaster-wrapper").style.display = "block";
            roomFirebase.set(newSessionDescription);
            roomFirebase.onDisconnect().remove();
        } else {
            // var session = {};
            connection.session = {};
            connection.onstream = addstream;
            connection.join(sessionDescription);
            document.getElementById("listener-wrapper").style.display = "block";
        }
    });
})(window.rtc = window.rtc || {});
