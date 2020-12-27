var ws = new WebSocket("ws://localhost:5678/");
var content = document.getElementById("ws-content");

ws.onopen = function () {
    document.getElementById('status').classList.replace("disconnected", "connected");
    document.getElementById('status').innerText = "OPEN";
}

ws.onclose = function() {
    document.getElementById('status').classList.replace("connected", "disconnected");
    document.getElementById('status').innerText = "CLOSED";
}

ws.onmessage = e => content.innerText = e.data;