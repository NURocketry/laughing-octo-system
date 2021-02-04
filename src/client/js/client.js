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
    
    //update currentData global for use in other functions
    currentData = { 
        'time':         wsValues[0],
        'altitude':     wsValues[1],
        'velocity':     wsValues[2],
        'acceleration': wsValues[3],
        'temperature': 	wsValues[4],
        'pressure':     wsValues[5]
    }

    //push ws data onto chart data array and handles statistics
    addData(currentData);

    //display all websocket data in relevant info boxes
    displayData(currentData);

    //re-draw charts accordingly
    updateCharts();

    //cut off datapoints to keep at 10 max and redraw
    trimData(currentData, 50);
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
    for ( let key in dataObj ) {
        // check to make sure we only add data we're expecting 
        if ( !datasets.hasOwnProperty(key) ) continue; 
        
        //check whether we're adding one or many datapoints
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
    let didTrimData = false;
    for ( let key in dataObj ) {
        // check to make sure we only trip data we're expecting 
        if ( !datasets.hasOwnProperty(key) ) continue; 

        // console.log(key, datasets[key]);
        if ( datasets[key].data.length > len ) {

            datasets[key].data.shift()
            didTrimData = true;
        }
    }
    return didTrimData;
}

/**
 * @param dataObj should have the form 
 * { dataSetName1: [new data 1], 
 *   dataSetName2: [new data 2], ... }
 * where dataSetName matches the .name property of the corresonding entry in the datasets object
 * 
 * data can be within arrays to allow for multiple datapoints to be added at once
 */
function displayData(dataObj) {
	//get HTMLCollection of text spans for each stat to be displayed
	const htmlValuesStats = document.querySelectorAll('.ws-stat'); 
	
    //Appends named data with all the minimums statistics
    //NOTE: Stats must be a min/max values
    for ( let item of htmlValuesStats ){
        let label = item.closest('.details').dataset.label;
        let quantity = item.closest('.details').dataset.quantity;

		//Adds data to currentData for easy display
		if( label.startsWith('min') ) //case sensitive
			dataObj[label] = datasets[quantity]['stats']['min'];
		else if( label.startsWith('max') ) //case sensitive
			dataObj[label] = datasets[quantity]['stats']['max'];
	}

    //get HTMLCollection of text spans for all telemetry values
    const htmlValuesTelemetry = document.querySelectorAll('.ws-value'); 
    
    //update all telemetry values
    for ( let item of htmlValuesTelemetry )
        item.innerText = dataObj[item.id]; //extract data based on id
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

// Selects each dropdown list title on the numeric telemetry page
let numericTelemetryDropdowns = document.querySelectorAll("select[name='numeric-telemetry']");

// Oh boy this is a lot
// Adds an event listener to teach dropdown menu that will trigger when a new value is selected 
Array.from(numericTelemetryDropdowns, dropdown => dropdown.addEventListener("change", function(e) {
    // 'this' is the element which caused the event listener to trigger, i.e. the 'select' tag
    // .closest() will traverse up the parent nodes until it finds a matching tag
    // we then change the data label of the info box to match the new selected value
    this.closest('.info-box').dataset.label = this.value;
    console.log(`[*] Updated ${this.closest('.info-box').dataset.label} box to ${this.value}`)
    // now that the value has been changed, update the corresponding box
    updateInfoBox(this.value);
}));

function updateInfoBox(label) {
    //get HTMLCollection of text spans for each value to be displayed
    const infoBoxes = document.querySelectorAll(`.info-box[data-label=${label}]`); 
    //still needs a for loop because multiple boxes can have the same label
    for ( let box of infoBoxes ) {
        const label = box.dataset.label; //value of the data-label attribute

        //different processing required for each dropdown
        const context = box.querySelector('select').name;
        switch (context) {
            case 'numeric-telemetry':
                //update value
                box.querySelector(".info-box-value").innerText = currentData[label]; //retrieve most recent value from global variable
                //update unit
                box.querySelector(".info-box-unit").innerText = dataInfo[label].unit; //retrieve correcct unit from reference with html escape codes
                break;
            case 'flight-stats':
                //not yet implememnted
                break;
            default:
                continue
        }
    }
}

function updateAllInfoBoxes() {
    const infoBoxes = document.querySelectorAll('.info-box'); //get HTMLCollection of text spans for each value to be displayed
    
    for ( let box of infoBoxes ) {
        const label = box.dataset.label; //value of the data-label attribute
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