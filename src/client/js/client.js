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
    let wsValues = e.data.split(',').map( x => parseFloat(x) ); //extract data from ws content and convert to number
    
    //ensure labels are the same as in 'datasets'
    //numbers put into arrays to match format of addData()
    let namedData = { 
        "altitude": 	[wsValues[0]],
        "temperature": 	[wsValues[1]],
        "pressure": 	[wsValues[2]],
        "velocity": 	[wsValues[3]],
        "time": 		[wsValues[5]]
    }

    //put values in textboxes
	wsValues.map( (val, i) => htmlValues[i] = val);

    //push ws data onto chart data array
    addData(namedData);

    //re-draw charts accordingly
    update();

    //cut off datapoints to keep at 10 max and redraw
    trimData(namedData, 100);
}


const defaultChartOptions = {
    line: { //line chart
        series: [], //empty series, will be filled later
        noData: { text: "No Data"}, //placeholder text until first data point is added
        chart: {
            type: 'line',
            animations: {
                enabled: true,
                easing: 'smooth',
                dynamicAnimation: { speed: 100}
            },
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        xaxis: {
            type: 'numeric' //ensures numbers are treated like numbers not strings
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'straight' },
        title: {
                text: 'Loading...',//placeholder
                align: 'right'
            },
    },
    gauge: {} //TODO
};

/**
 * @param data : array of datapoints
 * @param hasChart : if the data has an associated chart
 * @param id : DOM id of the chart div
 * @param options : the apexCharts options for the chart
 */
let datasets = {
    altitude: {
        data: [],
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
        data: [],
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
        data: [],
        hasChart: true,
        id: "#pressure-chart",
        options: {
            ...defaultChartOptions.line, 
            ...{ //rest will override defaults
                title: { text: 'Pressure' }
            }
        }
    },
    velocity: {
        data: [],
        hasChart: true,
        id: "#velocity-chart",
        options: {
            ...defaultChartOptions.line, 
            ...{ //rest will override defaults
                title: { text: 'Velocity' }
            }
        }
    },
    acceleration: {
        data: [],
        hasChart: true,
        id: "#acceleration-chart",
        options: {
            ...defaultChartOptions.line, 
            ...{ //rest will override defaults
                title: { text: 'Acceleration' }
            }
        }
    },
    time: {
        data: [],
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

/**
 * @param dataObj should have the form 
 * { dataSetName1: [new data 1], 
 *   dataSetName2: [new data 2], ... }
 * where dataSetName matches the .name property of the corresonding entry in the datasets object
 * 
 * data should be within arrays to allow for multiple datapoints to be added at once
 */
function addData(dataObj) {
    for ( let key in dataObj )
        datasets[key].data.push( ...dataObj[key] ); // spread operator (...) 'splits' array into function arguments
}

function trimData(dataObj, len) {
    let flag = false;
    for ( let key in dataObj ) {
        // console.log(key, datasets[key].data.length);
        if ( datasets[key].data.length > len ) {

            console.log(datasets[key].data.shift(), " ");

            flag = true;
        }
    }
    return flag;
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
