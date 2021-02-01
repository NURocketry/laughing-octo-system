//open websocket connection
const ws = new WebSocket('ws://localhost:5678/');

//basic websocket handlers
ws.onopen = function () {
    //change status indicator
	document.querySelector('.status').classList.replace('disconnected', 'connected');
    document.querySelector('.status').innerText = 'OPEN';
	document.querySelector(".status");
	let status = document.querySelectorAll(".status");
	for (let item of status) 
		item.style.color= "green";
}


ws.onclose = function() {
    //change status indicator
	document.querySelector('.status').classList.replace('connected', 'disconnected');
    document.querySelector('.status').innerText = 'CLOSED';
	let status = document.querySelectorAll(".status");
	for (let item of status) 
		item.style.color= "red";
		
}

ws.onmessage = function(e) { 
    wsMessageHandler(e);
};

function wsMessageHandler(e) {
    let wsValues = e.data.split(',').map( x => parseFloat(x) ); //extract data from ws content and convert to number
    
    let namedData = { 
        'time':         wsValues[0],
        'altitude':     wsValues[1],
        'velocity':     wsValues[2],
        'acceleration': wsValues[3],
        'temperature': 	wsValues[4],
        'pressure':     wsValues[5]
    }


    //push ws data onto chart data array and handles statistics
    addData(namedData);


	//get HTMLCollection of text spans for each value to be displayed
	const htmlValuesTelemetry = document.querySelectorAll('.ws-value'); 
	const htmlValuesStats = document.querySelectorAll('.ws-stat'); 

    /**
     * this works but relies on the id being _exactly_ the same as the object label, which is fine for the moment but
     * could cause issues. more robust solution below. I'm leaving this one uncommented for performance and because 
     * it works atm.
     */
    
    
	
	//Appends named data with all the minimums statistics
    for ( let item of htmlValuesStats ){
		
		//i.e Concert minVelocity => velocity
		// so it is in the same format as in datasets
		let formatted = item.id.slice(3).toLowerCase();

		//Adds data to namedData for easy display
		namedData[item.id] = datasets[formatted]['stats']['min'];
		if(item.id.slice(0,3) == 'min') {
			namedData[item.id] = datasets[formatted]['stats']['min'];
		}
		else if(item.id.slice(0,3) == 'max') {
			namedData[item.id] = datasets[formatted]['stats']['max'];
		}
	}

    for ( let item of htmlValuesTelemetry )
        item.innerText = namedData[item.id]; //extract data based on id
	

    //re-draw charts accordingly
    update();

    //cut off datapoints to keep at 10 max and redraw
    trimData(namedData, 50);
};


//Templates for the different graphs options
//Documentation: https://apexcharts.com/docs/installation/
 
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

	}
}


//Specific Implementaions of different charts
/**
 * @param data : array of datapoints
 * @param stats: statistics for that data element 
 * @param hasChart : if the data has an associated chart
 * @param id : DOM id of the chart div
 * @param options : the apexCharts options for the chart
 */
let datasets = {
    altitude: {
        data: [],
		stats: {min: null, max: null},
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
		stats: {min: null, max: null},
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
		stats: {min: null, max: null},
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
		stats: {min: null, max: null},
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
		stats: {min: null, max: null},
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
		stats: {min: null, max: null},
		id: '#time-chart',
        hasChart: false, //IMPORTANT, time has NO graph
        options: {
            ...defaultChartOptions.area, 
            ...{ //rest will override defaults
				colors: ['#00f5d4'],
                title: { text: 'Time' }
            }
        }
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
    for ( let key in dataObj ) {
        if (Array.isArray(dataObj[key]))
            datasets[key].data.push(...dataObj[key]);// spread operator (...) 'splits' array into function arguments
        else 
            datasets[key].data.push(dataObj[key]);
		//Determines the min/max for each element in the dataset
		//used for the statistics page
		let min = datasets[key].stats.min; 
		let max = datasets[key].stats.max; 
		if( dataObj[key] < min || min == null ) {
			datasets[key].stats.min = dataObj[key][0]; 
		}
		if(dataObj[key] > max || max == null) {
			datasets[key].stats.max = dataObj[key][0]; 
		}

	}
}

function trimData(dataObj, len) {
    let flag = false;
    for ( let key in dataObj ) {

        console.log(key, datasets[key]);
        if ( datasets[key].data.length > len ) {

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
