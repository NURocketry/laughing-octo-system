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

let flightStats= { 
	maxVelocity: 		null,
	maxAcceleration: 	null,
	maxAltitude: 		null,
	minTemperature: 	null,
	maxTemperature: 	null,
	minPressure: 		null,
	maxPressure: 		null
}

function wsMessageHandler(e) {
    let wsValues = e.data.split(',').map( x => parseFloat(x) ); //extract data from ws content and convert to number
    
    let namedData = { 
        'time': 			[wsValues[0]],
        'altitude': 		[wsValues[1]],
        'velocity': 		[wsValues[2]],
        'acceleration': 	[wsValues[3]],
        'temperature': 		[wsValues[4]],
        'pressure': 		[wsValues[5]]
    }

	//get HTMLCollection of text spans for each value to be displayed
	const htmlValuesTelemetry = document.querySelectorAll('.ws-value'); 
	const htmlValuesStats = document.querySelectorAll('.ws-stat'); 
    
    /**
     * this works but relies on the id being _exactly_ the same as the object label, which is fine for the moment but
     * could cause issues. more robust solution below. I'm leaving this one uncommented for performance and because 
     * it works atm.
     */
	statUpdate(wsValues);
    for ( let item of htmlValuesTelemetry ) 
        item.innerText = namedData[item.id]; //extract data based on id
    for ( let test of htmlValuesStats ) 
        test.innerText = flightStats[test.id]; //extract data based on id

    /**
     * Better solution based on matching the object label to the html ID. means it doesnt need to be a perfect
     * match but containing the string is enough.
     */
    // for ( let item of htmlValues ) { //each matching DOM element
    //     for ( let label in namedData ) { //each entry in namedData
    //         if ( item.id.includes(label) ) { //does the html ID contain the label somewhere *CASE SENSITIVE*
    //             item.innerText = namedData[label]; //set the value from the corresponding item
    //         }
    //     }
    // }

    //push ws data onto chart data array
    addData(namedData);

    //re-draw charts accordingly
    update();

    //cut off datapoints to keep at 10 max and redraw
    //trimData(namedData, 50);
};

function statUpdate(data) {
	console.log(data);
	if(flightStats.maxVelocity == null) {
		flightStats.maxVelocity = data[2]
		flightStats.maxAcceleration = data[3]
		flightStats.maxAltitude = data[1]
		flightStats.minTemperature = data[4]
		flightStats.maxTemperature = data[4]
		flightStats.minPressure = data[5]
		flightStats.maxPressure = data[5]
	}

	if(data[2] > flightStats.maxVelocity)
		flightStats.maxVelocity = data[2]

	if(data[3] > flightStats.maxAcceleration)
		flightStats.maxAcceleration = data[3]

	if(data[1] > flightStats.maxAltitude)
		flightStats.maxAltitude = data[1]

	if(data[4] < flightStats.minTemperature)
		flightStats.minTemperature = data[4]

	if(data[4] > flightStats.maxTemperature)
		flightStats.maxTemperature = data[4]

	if(data[5] < flightStats.minPressure)
		flightStats.minPressure = data[5]

	if(data[5] > flightStats.maxPressure)
		flightStats.maxPressure = data[5]

}

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
				colors: ['#9b5de5'],
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
				colors: ['#f15bb5'],
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
				colors: ['#fee440'],
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
				colors: ['#00bbf9'],
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
				colors: ['#00f5d4'],
                title: { text: 'Acceleration' }
            }
        }
    },
    time: {
        data: [],
		id: '#time-chart',
        hasChart: true,
        options: {
            ...defaultChartOptions.area, 
            ...{ //rest will override defaults
				colors: ['#00f5d4'],
                title: { text: 'Time' }
            }
        }
    }
}

function statUpdate(data) {
	console.log(data);
	if(flightStats.maxVelocity == null) {
		flightStats.maxVelocity = data[2]
		flightStats.maxAcceleration = data[3]
		flightStats.maxAltitude = data[1]
		flightStats.minTemperature = data[4]
		flightStats.maxTemperature = data[4]
		flightStats.minPressure = data[5]
		flightStats.maxPressure = data[5]
	}

	if(data[2] > flightStats.maxVelocity)
		flightStats.maxVelocity = data[2]

	if(data[3] > flightStats.maxAcceleration)
		flightStats.maxAcceleration = data[3]

	if(data[1] > flightStats.maxAltitude)
		flightStats.maxAltitude = data[1]

	if(data[4] < flightStats.minTemperature)
		flightStats.minTemperature = data[4]

	if(data[4] > flightStats.maxTemperature)
		flightStats.maxTemperature = data[4]

	if(data[5] < flightStats.minPressure)
		flightStats.minPressure = data[5]

	if(data[5] > flightStats.maxPressure)
		flightStats.maxPressure = data[5]

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

            // console.log(datasets[key].data.shift(), ' ');
            datasets[key].data.shift()
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
