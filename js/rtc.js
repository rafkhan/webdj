(function(_rtc) {

    _rtc.connection = new RTCMultiConnection();
    var connection = _rtc.connection;
    connection.firebase = "webdjrooms";

    var roomid = window.location.pathname.replace(".", "").replace("/", "");
    var firebaseURL = "https://" + connection.firebase + ".firebaseio.com/";

    var roomFirebase = new Firebase(firebaseURL + roomid);
    roomFirebase.once('value', function(data) {
        function addstream(e) {
            e.mediaElement.style.display = "none";
            document.body.appendChild(e.mediaElement);
        }

        var sessionDescription = data.val();
        if (sessionDescription == null) {
            connection.session = {
                audio: true,
                oneway: true,
                data: true
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
            connection.onmessage = function(e) {
                var deckel = document.getElementById("listener-"+e.data.deck);
                if (e.data.paused) {
                    deckel.innerhtml = "";
                    return;
                }
                var innerhtml = e.data.title || undefined;
                if (e.data.artist) {
                    if (!innerhtml)
                        innerhtml = e.data.artist || undefined;
                    else
                        innerhtml += " by "+e.data.artist;
                }
                if (innerhtml)
                    deckel.innerHTML = e.data.title + " by " + e.data.artist;
                else
                    deckel.innerHTML = "...some song by some artist";
            }
            connection.join(sessionDescription);
            document.getElementById("listener-wrapper").style.display = "block";
        }
    });
})(window.rtc = window.rtc || {});
