const ws = new WebSocket("ws://localhost:5678/");

ws.onopen = function () {
    document.getElementById('status').classList.replace("disconnected", "connected");
    document.getElementById('status').innerText = "OPEN";
}

ws.onclose = function() {
    document.getElementById('status').classList.replace("connected", "disconnected");
    document.getElementById('status').innerText = "CLOSED";
}

ws.onmessage = function(e) { 
    wsMessageHandler(e);
};



const htmlValues = document.getElementsByClassName("ws-value");

function wsMessageHandler(e) {
    let wsValues = new Array(4);
    wsValues = e.data.split(','); //extract data from ws content

    wsValues.map( (val, i) => htmlValues[i].innerText = val);
}