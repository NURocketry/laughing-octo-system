//open websocket connection
const ws = new WebSocket("ws://localhost:5678/");

//text spans for each value
const htmlValues = document.querySelectorAll(".ws-value"); //return array of all matching DOM elements

//basic websocket handlers
ws.onopen = function () {
    //change status indicator
    document.querySelector('#status').classList.replace("disconnected", "connected");
    document.querySelector('#status').innerText = "OPEN";
}

ws.onclose = function() {
    //change status indicator
    document.querySelector('#status').classList.replace("connected", "disconnected");
    document.querySelector('#status').innerText = "CLOSED";
}

ws.onmessage = function(e) { 
    wsMessageHandler(e);
};

function wsMessageHandler(e) {
    let wsValues = e.data.split(','); //extract data from ws content

    let namedData = {
        "altitude": wsValues[0]
    }

    wsValues.map( (val, i) => htmlValues[i].innerText = val);

}


const defaultChartOptions = {
    line: { //line chart
        series: [], //empty series, will be filled later
        noData: { text: "loading..." }, //placeholder text until first data point is added
        chart: {
            type: 'line',
            animations: {
                enabled: true,
                easing: 'smooth',
                dynamicAnimation: { speed: 1000 }
            },
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        xaxis: {
            type: 'numeric' //ensures numbers are treated like numbers not strings
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        title: {
                text: 'loading...', //placeholder
                align: 'left'
            },
    },
    gauge: {} //TODO
};

let datasets = {
    /**
     * @param data : array of datapoints
     * @param hasChart : if the data has an associated chart
     * @param options : the apexCharts options for the chart
     * @param id : DOM id of the chart div
     */
    altitude: {
        data: [0],
        hasChart: true,
        id: "#altitude-chart",
        options: {
            ...defaultChartOptions.line, 
            ...{ //rest will override defaults
                title: { text: 'Altitude' }
            }
        }
    },
    temperature: {
        data: [0],
        hasChart: true,
        id: "#temperature-chart",
        options: {
            ...defaultChartOptions.line, 
            ...{ //rest will override defaults
                title: { text: 'Temperature' }
            }
        }
    },
    pressure: {
        data: [0],
        hasChart: true,
        id: "#pressure-chart",
        options: {
            ...defaultChartOptions.line, 
            ...{ //rest will override defaults
                title: { text: 'Pressure' }
            }
        }
    },
    time: {
        data: [0],
        hasChart: false
    }
}
/**
 * Automate initialising for when we have heaps of charts
 */
function init() { //create the actual chart for each 
    for ( let s in datasets) {// each set in the datasets object
        if (datasets[s].hasChart) {// if it contains a .chart property 
            let chartName = s.replace(/^\w/, c => c.toUpperCase()); //capitalise first letter
            // creat chart object
            charts[chartName] = new ApexCharts(
                document.querySelector(datasets[s].id), 
                datasets[s].options
            );
        }
    }
}

/**
 * Automate rendering for when we have heaps of charts
 */
function render() { 
    // call ApexCharts method for chart object
    for ( let s in datasets) { // each set in the datasets object
        let chartName = s.replace(/^\w/, c => c.toUpperCase()); //capitalise first letter
        if (datasets[s].hasChart) // if it contains a .chart property
            charts[chartName].render();
    }
}

function addData(dataObj) {
    /**
     * @param dataObj : should have the form 
     * { dataSetName1: [new data 1], 
     *   dataSetName2: [new data 2] }
     * where dataSetName matches the .name property of the corresonding entry in the datasets object
     */

    for ( let key in dataObj ) //set is the string from of each key in dataObj
        datasets[key].data.push( ...dataObj[key] ) // spread operator (...) turns array into function arguments
}

function update() {
    for ( let s in datasets) { // each set in the datasets object
        if (datasets[s].hasChart) {// if it contains a .chart property 
            let chartName = s.replace(/^\w/, c => c.toUpperCase()); //capitalise first letter
            charts[chartName].updateSeries([{ data: datasets[s].data }])
        }
    }
}

//hold all the ApexCharts chart elements
let charts = new Object();

init();
render();

// let Altitude = new ApexCharts(
//     document.querySelector(datasets.altitude.id), 
//     datasets.altitude.options
// );
// let Temperature = new ApexCharts(
//     document.querySelector(datasets.temperature.id), 
//     datasets.temperature.options
// );
// let Pressure = new ApexCharts(
//     document.querySelector(datasets.pressure.id), 
//     datasets.pressure.options
// );


// /////////////////////////testing//////////////////////
// var options = {
//     chart: {
//       type: 'line'
//     },
//     series: [{
//       name: 'sales',
//       data: [30,40,35,50,49,60,70,91,125]
//     }],
//     xaxis: {
//       categories: [1991,1992,1993,1994,1995,1996,1997, 1998,1999]
//     }
//   }
  
//   var charts.test = new ApexCharts(document.querySelector("#chart"), options);
  
//   chart.render();