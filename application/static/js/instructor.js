$(document).ready(()=>{
    console.log("document is ready");
});

let namespace = "/web";

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
socket.on('connect', function() {
    console.log('Connected!');
});

socket.on('smileResponse', function(newSmileCount) {
    $("#totalSmiling").text(newSmileCount + " people seem to be smiling")
    console.log('smile detected!');
});

socket.on('confuseResponse', function(newConfuseCount) {
    $("#totalConfused").text(newConfuseCount + " people seem confused")
    console.log('confuse detected!');
});

socket.on('raiseHandResponse', function(newHandRaiseCount) {
    $("#totalRaisedHand").text(newHandRaiseCount+ " people seem to have raised their hands")
    console.log('hand raise detected!');
});