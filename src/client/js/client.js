//open websocket connection
const ws = new WebSocket('ws://localhost:5678/');

//basic websocket handlers
ws.onopen = function () {
    //change status indicator
	document.querySelector('#status').classList.replace('disconnected', 'connected');
    document.querySelector('#status').innerText = 'OPEN';
}


ws.onclose = function() {
    //change status indicator
	document.querySelector('#status').classList.replace('connected', 'disconnected');
    document.querySelector('#status').innerText = 'CLOSED';
}

ws.onmessage = function(e) { 
    wsMessageHandler(e);
};

function wsMessageHandler(e) {
    let wsValues = e.data.split(',').map( x => parseFloat(x) ); //extract data from ws content and convert to number
    
    //update currentData global for use in other functions
    currentData = { 
        'time': 			wsValues[0],
        'altitude': 		wsValues[1],
        'velocity': 		wsValues[2],
        'acceleration': 	wsValues[3],
        'temperature': 		wsValues[4],
        'pressure': 		wsValues[5]
    }

    //update data and labels of info boxes
    updateInfoBoxes(currentData);

    //push ws data onto chart data array
    addData(currentData);

    //re-draw charts accordingly
    updateCharts();

    //cut off datapoints to keep at 10 max and redraw
    //trimData(namedData, 50);
};


//Templates for the different graphs options
//Documentation: https://apexcharts.com/docs/installation/
//TODO: Remove repeated code 
 
const defaultChartOptions = {
	line: { 
		series: [], 
		noData: { text: "No Data"}, 

		chart: {
			type: 'line',
			foreColor: '#ccc',
			toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'smooth',
                dynamicAnimation: { speed: 1000 }
            },
		},
		dropShadow: {
			enabled: true,
			top: 3,
			left: 2,
			blur: 4,
			opacity: 1,
		},

		stroke: {
			curve: 'smooth'
		},

		dataLabels: {
			enabled: false 
		},

		tooltip: {
			theme: 'dark'
		},

		grid: {
			borderColor: "#535A6C",
			xaxis: {
				lines: { show: false}
			}
		},

		xaxis: {
			type: 'numeric',
		},

	},

	area: { 
		series: [], 
		noData: { text: "No Data"}, 

		chart: {
			type: 'area',
			foreColor: '#ccc',
			toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'smooth',
                dynamicAnimation: { speed: 1000 }
            },
		},
		dropShadow: {
			enabled: true,
			top: 3,
			left: 2,
			blur: 4,
			opacity: 1,
		},

		stroke: {
			curve: 'smooth'
		},

		dataLabels: {
			enabled: false
		},

		tooltip: {
			theme: 'dark'
		},

		grid: {
			borderColor: "#535A6C",
			xaxis: {
				lines: { show: false}
			}
		},

		xaxis: {
			type: 'numeric',
		},

	},

	/*
	//Can only take a single value not a series
	guage: {
		series: [], 
		noData: { text: "No Data"}, 

		chart: {
			type: "radialBar",
			foreColor: '#ccc',
			toolbar: { show: false },
            animations: {
                enabled: false,
                easing: 'smooth',
                dynamicAnimation: { speed: 1000 }
            },

		},

		series: [67],
		plotOptions: {

		radialBar: {
			startAngle: -135,
			endAngle: 135,

			track: {
				background: '#333',
				startAngle: -135,
				endAngle: 135,
			},
			dataLabels: { enabled: true}
		}
	}
	*/
}


//Specific Implementaions of different charts
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
        id: '#altitude-chart',
        options: {
            ...defaultChartOptions.area, 
            ...{ //rest will override defaults
				colors: ['#d45087'],
                title: { text: 'Altitude' }
            }
        }
    },
    temperature: {
        data: [],
        hasChart: true,
        id: '#temperature-chart',
        options: {
            ...defaultChartOptions.line, 
            ...{ //rest will override defaults
				colors: ['#ffa600'],
                title: { text: 'Temperature' }
            }
        }
    },
    pressure: {
        data: [],
        hasChart: true,
        id: '#pressure-chart',
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
        id: '#velocity-chart',
        options: {
            ...defaultChartOptions.area, 
            ...{ //rest will override defaults
				colors: ['#ff7c43'],
                title: { text: 'Velocity' }
            }
        }
    },
    acceleration: {
        data: [],
        hasChart: true,
        id: '#acceleration-chart',
        options: {
            ...defaultChartOptions.area, 
            ...{ //rest will override defaults
				colors: ['#ff1919'],
                title: { text: 'Acceleration' }
            }
        }
    },
    time: {
        data: [],
        hasChart: false
    }
}

// details of data coming in
const dataInfo = {
    'time': {
        heading: "Time",
        unit: "s"
    },
    'altitude': {
        heading: "Altitude",
        unit: "m"
    },
    'velocity': {
        heading: "Velocity",
        unit: "m/s"
    },
    'acceleration': {
        heading: "Acceleration",
        unit: "m/s\xB2" /*escape code for superscript two*/
    },
    'temperature': {
        heading: "Temperature",
        unit: "\xB0C" /*escape code for degree symbol*/
    },
    'pressure': {
        heading: "Pressure",
        unit: "hPa"
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
 * data can be within arrays to allow for multiple datapoints to be added at once
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

            // console.log(datasets[key].data.shift(), ' ');
            datasets[key].data.shift()
            flag = true;
        }
    }
    return flag;
}

function updateCharts() {
    for ( let s in datasets) { // each set in the datasets object
        if (datasets[s].hasChart) {// if it contains a .chart property 
            let chartName = s.replace(/^\w/, c => c.toUpperCase()); //capitalise first letter
            charts[chartName].updateSeries([{ data: datasets[s].data }])
        }
    }
}


/***************************
 * INFO BOX DROPDOWN STUFF *
 **************************/


/**
 * @param dataObj should have the form 
 * { dataSetName1: [new data 1], 
 *   dataSetName2: [new data 2], ... }
 * where dataSetName matches the .name property of the corresonding entry in the datasets object
 * 
 * data can be within arrays to allow for multiple datapoints to be added at once
 */
function updateInfoBoxes() {
    const infoBoxes = document.querySelectorAll('.info-box'); //get HTMLCollection of text spans for each value to be displayed
    
    for ( let box of infoBoxes ) {
        const label = box.dataset.label; //value of the data-label attribute
        //update heading
        box.querySelector(".info-box-heading").innerText = dataInfo[label].heading; //retrieve correct heading from reference
        //update value
        box.querySelector(".info-box-value").innerText = currentData[label]; //retrieve most recent value from global variable
        //update unit
        box.querySelector(".info-box-unit").innerText = dataInfo[label].unit; //retrieve correcct unit from reference with html escape codes
    }
}




/**
 * ACTUAL CODE TO RUN
 */

// hold all the ApexCharts chart elements
let charts = new Object();

// hold the most recent value of each datapoint
let currentData = { 
    'time': null,
    'altitude': null,
    'velocity': null,
    'acceleration': null,
    'temperature': null,
    'pressure': null
}

init();
render();