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
    
    let namedData = { 
        'time': 			[wsValues[0]],
        'altitude': 		[wsValues[1]],
        'velocity': 		[wsValues[2]],
        'acceleration': 	[wsValues[3]],
        'temperature': 		[wsValues[4]],
        'pressure': 		[wsValues[5]]
    }

    const htmlValues = document.querySelectorAll('.ws-value'); //get HTMLCollection of text spans for each value to be displayed
    
    /**
     * this works but relies on the id being _exactly_ the same as the object label, which is fine for the moment but
     * could cause issues. more robust solution below. I'm leaving this one uncommented for performance and because 
     * it works atm.
     */
    for ( let item of htmlValues ) 
        item.innerText = namedData[item.id]; //extract data based on id

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

	guage: {
		series: [76],
		chart: {
			type: 'radialBar',
			//offsetY: -20,
			sparkline: { enabled: false },
			foreColor: '#ccc'
		},
		plotOptions: {
			radialBar: {
				startAngle: -90,
				endAngle: 90,
			track: {
				background: "#e7e7e7",
				strokeWidth: '97%',
				margin: 5, // margin is in pixels
				dropShadow: {
					enabled: true,
					top: 2,
					left: 0,
					color: '#999',
					opacity: 1,
					blur: 2
				}
			},
			dataLabels: {
				name: { show: false },
				value: {
					//offsetY: -2,
					fontSize: '22px'
				}
			}
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				shadeIntensity: 0.4,
				inverseColors: false,
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 50, 53, 91]
			},
		},
		labels: ['Average Results'],
	}
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
    acceleration: {
        data: [],
        hasChart: true,
        id: '#acceleration-guage',
        options: {
            ...defaultChartOptions.guage, 
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
