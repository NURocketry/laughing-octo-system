//open websocket connection
const ws = new WebSocket("ws://localhost:5678/");

//basic websocket handlers
ws.onopen = function () {
    //change status indicator
    document.getElementById('status').classList.replace("disconnected", "connected");
    document.getElementById('status').innerText = "OPEN";
}

ws.onclose = function() {
    //change status indicator
    document.getElementById('status').classList.replace("connected", "disconnected");
    document.getElementById('status').innerText = "CLOSED";
}

ws.onmessage = function(e) { 
    wsMessageHandler(e);
};


//text spans for each value
const htmlValues = document.getElementsByClassName("ws-value");

function wsMessageHandler(e) {
    let wsValues = new Array(4);
    wsValues = e.data.split(','); //extract data from ws content

    wsValues.map( (val, i) => htmlValues[i].innerText = val);

    // altitudeChart.appendData([
    //     wsValues[0], // altitude
    //     wsValues[3] // milliseconds elapsed
    // ])
}

//Apex charts
var altitudeChartOptions = {
    chart: {
        type: 'line'
    },
    series: [{
        name: 'altitude',
        data: [ // [time, altitude]
            [0,0],
            [1,1.5],
            [2,2]
        ]
    }],
    xaxis: {
    //    type: 'numeric', 
    }
  }
  
  var altitudeChart = new ApexCharts(document.querySelector("#altitude-chart"), altitudeChartOptions);
  
  altitudeChart.render();