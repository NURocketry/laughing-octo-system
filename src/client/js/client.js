//open websocket connection
const ws = new WebSocket('ws://{{webserver}}:5678/');

//get environment variables
var azKey1 = "{{ azKey1 }}"
var azKey2 = "{{ azkey2 }}"
//basic websocket handlers
ws.onopen = function () {
    //change status indicator
    let status = document.querySelectorAll(".status");
    for (let item of status) {
        item.style.color = "green";
        item.innerText = "OPEN";
    }
}


ws.onclose = function () {
    //change status indicator
    let status = document.querySelectorAll(".status");
    for (let item of status) {
        item.style.color = "red";
        item.innerText = "CLOSED";
    }

}



ws.onmessage = function (e) {
    //logs the current message to the console
    //console.log(e)
    wsMessageHandler(e);
};

function wsMessageHandler(e) {
    let wsValues = e.data.split(',').map(x => parseFloat(x)); //extract data from ws content and convert to number

    // update currentData global for use in other functions
    currentData = {
        ...currentData, //spread operator ensures object isn't overridden, only named field are updated.
        'time': wsValues[0],
        'altitude': wsValues[1],
        'velocity': wsValues[2],
        'acceleration': wsValues[3],
        'temperature': wsValues[4],
        'pressure': wsValues[5]
    }

    //push ws data onto chart data array and handles statistics
    addData(currentData);

    //display all websocket data in relevant info boxes
    displayData(currentData);

    //re-draw charts accordingly
    updateCharts();

    //cut off data points to keep at 10 max and redraw
    trimData(currentData, 50);
};


//Templates for the different graphs options
//Documentation: https://apexcharts.com/docs/installation/

let defaultChartOptions = {
    line: {
        series: [
            {
                name: "Series",
                data: []
            }
        ],
        noData: {text: "No Data"},
        chart: {
            type: 'line',
            foreColor: '#ccc',
            toolbar: {
            theme: 'dark',
            show: true,
            offsetX: 0,
            offsetY: 0,
            tools: {
                download: true,
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true,
                customIcons: []
            },
            export: {
                csv: {
                    filename: undefined,
                    columnDelimiter: ',',
                    headerCategory: 'category',
                    headerValue: 'value',
                    dateFormatter(timestamp) {
                        return new Date(timestamp).toDateString()
                    }
                },
                svg: {
                    filename: undefined,
                },
                png: {
                    filename: undefined,
                }
            },
            autoSelected: 'zoom'
        },
            animations: {
                enabled: true,
                easing: 'smooth',
                dynamicAnimation: {speed: 1000}
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

        grid: {
            borderColor: "#535A6C",
            xaxis: {
                lines: {show: false}
            }
        },

        xaxis: {
            type: 'numeric',
        },

    },

    area: {
        series: [
            {
                name: "Series",
                data: []
            }
        ],
        noData: {text: "No Data"},
        chart: {
            type: 'area',
            foreColor: '#ccc',
            toolbar: {
                theme: 'dark',
                show: true,
                offsetX: 0,
                offsetY: 0,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                    customIcons: []
                },
                export: {
                    csv: {
                        filename: undefined,
                        columnDelimiter: ',',
                        headerCategory: 'category',
                        headerValue: 'value',
                        dateFormatter(timestamp) {
                            return new Date(timestamp).toDateString()
                        }
                    },
                    svg: {
                        filename: undefined,
                    },
                    png: {
                        filename: undefined,
                    }
                },
                autoSelected: 'zoom'
            },
            animations: {
                enabled: true,
                easing: 'smooth',
                dynamicAnimation: {speed: 1000}
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


        grid: {
            borderColor: "#535A6C",
            xaxis: {
                lines: {show: false}
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
        series: [
            {
                name: "Altitude",
                data: []
            }
        ],
        // data: [],
        stats: {min: null, max: null},
        hasChart: true,
        active: true,
        id: '#altitude-chart',
        options: {
            ...defaultChartOptions.area,
            ...{ //rest will override defaults
                colors: ['#9b5de5'],
                // title: { text: 'Altitude' }
            }
        }
    },
    temperature: {
        data: [],
        series: [
            {
                name: "Temperature",
                data: []
            }
        ],
        stats: {min: null, max: null},
        hasChart: true,
        active: true,
        id: '#temperature-chart',
        options: {
            ...defaultChartOptions.line,
            ...{ //rest will override defaults
                colors: ['#f15bb5'],
                // title: { text: 'Temperature' }
            }
        }
    },
    pressure: {
        data: [],
        series: [
            {
                name: "Pressure",
                data: []
            }
        ],
        stats: {min: null, max: null},
        hasChart: true,
        active: true,
        id: '#pressure-chart',
        options: {
            ...defaultChartOptions.line,
            ...{ //rest will override defaults
                colors: ['#fee440'],
                // title: { text: 'Pressure' }
            }
        }
    },
    velocity: {
        data: [],
        series: [
            {
                name: "Velocity",
                data: []
            }
        ],
        stats: {min: null, max: null},
        hasChart: true,
        active: true,
        id: '#velocity-chart',
        options: {
            ...defaultChartOptions.area,
            ...{ //rest will override defaults
                colors: ['#00bbf9'],
                // title: { text: 'Velocity' }
            }
        }
    },
    acceleration: {
        data: [],
        series: [
            {
                name: "Acceleration",
                data: []
            }
        ],
        stats: {min: null, max: null},
        hasChart: true,
        active: true,
        id: '#acceleration-chart',
        options: {
            ...defaultChartOptions.area,
            ...{ //rest will override defaults
                colors: ['#00f5d4'],
                // title: { text: 'Acceleration' }
            }
        }
    },
    // time: {
    //     data: [],
    // 	stats: {min: null, max: null},
    // 	id: '#time-chart',
    //     hasChart: false, //IMPORTANT, time has NO graph
    //     active: false,
    //     options: {
    //         ...defaultChartOptions.area, 
    //         ...{ //rest will override defaults
    // 			colors: ['#00f5d4'],
    //             // title: { text: 'Time' }
    //         }
    //     }
    // },
    empty: { //placeholder chart for dropdown chart switching
        data: [],
        series: [
            {
                name: "Empty",
                data: []
            }
        ],
        id: '#empty-chart',
        hasChart: true,
        active: true,
        options: {
            ...defaultChartOptions.area
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
    for (let s in datasets) {// each set in the datasets object
        if (datasets[s].hasChart) {// if it contains a .chart property 
            // let chartName = s.replace(/^\w/, c => c.toUpperCase()); //capitalise first letter
            // creat chart object
            charts[s] = new ApexCharts(
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
    for (let s in datasets) { // each set in the datasets object
        // let chartName = s.replace(/^\w/, c => c.toUpperCase()); //capitalise first letter
        if (datasets[s].hasChart && datasets[s].active) // if it contains a .chart property
            charts[s].render();
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
    for (let key in dataObj) {

        // check to make sure we only add data we're expecting 
        if (!datasets.hasOwnProperty(key)) continue;

        if (datasets[key].hasChart) {// if it contains a .chart property
            // console.log(datasets, key);
            datasets[key].series[0].data.push([dataObj["time"], dataObj[key]]);

            //Determines the min/max for each element in the dataset
            //used for the statistics page
            let min = datasets[key].stats.min;
            let max = datasets[key].stats.max;
            if (dataObj[key] < min || min == null) { //if current value is smaller than min
                datasets[key].stats.min = dataObj[key];
            }
            if (dataObj[key] > max || max == null) {  //if current value is larger than max
                datasets[key].stats.max = dataObj[key];
            }
        }
    }
}

function trimData(dataObj, len) {
    let didTrimData = false;
    for (let key in dataObj) {
        // check to make sure we only trip data we're expecting 
        if (!datasets.hasOwnProperty(key)) continue;
        // console.log(key, datasets[key]);
        if (datasets[key].series[0].data.length > len) {
            datasets[key].series[0].data.shift()
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
    for (let item of htmlValuesStats) {
        let label = item.closest('.details').dataset.label;
        let quantity = item.closest('.details').dataset.quantity;

        //Adds data to currentData for easy display
        if (label.startsWith('min')) //case sensitive
            dataObj[label] = datasets[quantity]['stats']['min'];
        else if (label.startsWith('max')) //case sensitive
            dataObj[label] = datasets[quantity]['stats']['max'];
    }

    // //get HTMLCollection of text spans for all telemetry values
    // const htmlValuesTelemetry = document.querySelectorAll('.ws-value'); 

    // //update all telemetry values
    // for ( let item of htmlValuesTelemetry )
    //     item.innerText = dataObj[item.id]; //extract data based on id
    updateAllInfoBoxValues();
}

function updateCharts() {
    for (let s in datasets) { // each set in the datasets object
        if (datasets[s].hasChart && datasets[s].active) {// if it contains a .chart property
            //TODO check if this if is required
            if (Object.keys(datasets[s].series[0].data).length != 0) {

                charts[s].updateSeries([{data: datasets[s].series[0].data}]); //musb be object within array

            }
        }
    }
}

/***************************
 * INFO BOX DROPDOWN STUFF *
 **************************/

function infoBoxDropdownHandler(e) {

    const infoBox = e.target.closest('.info-box'); //div containing the dropdown

    console.log(`[*] Updating ${infoBox.dataset.label} box to ${e.target.value}`)

    // 'this' is the element which caused the event listener to trigger, i.e. the 'select' tag
    // .closest() will traverse up the parent nodes until it finds a matching tag
    // we then change the data label of the info box to match the new selected value
    infoBox.dataset.label = e.target.value;

    // now that the value has been changed, update the corresponding box
    updateInfoBoxDetails(infoBox, e.target.value);

}

// Update the value and other relevant details for a specific info box
/**
 * TODO: KNOWN BUG
 * Data will sometimes display as undefined for 'flight-stats' info boxes until next refresh
 * After next refresh (on updateInfoBoxDetails() call) the data will display correctly
 */
function updateInfoBoxDetails(infoBox, label) {
    //get HTMLCollection of text spans for each value to be displayed
    const infoBoxes = document.querySelectorAll(`.info-box[data-label=${label}]`);
    //still needs a for loop because multiple boxes can have the same label
    for (let box of infoBoxes) {

        //update value w/ most recent value from global variable
        box.querySelector(".info-box-value").innerText = currentData[box.dataset.label];

        //different processing required for each dropdown
        const context = box.querySelector('select').name;
        switch (context) {
            case 'numeric-telemetry':
                //update unit w/ correct unit from reference with html escape codes
                box.querySelector(".info-box-unit").innerText = dataInfo[box.dataset.label].unit;
                break;
            case 'flight-stats':
                box.dataset.quantity = box.dataset.label.slice(3).toLowerCase(); //unfortunately hardcoded but im tired

                console.log("[?]", box.dataset.label, box.dataset.quantity);
                //update unit correct unit from reference with html escape codes
                //... box.dataset.quantity gives quantity in question, i.e. maxValue -> value
                box.querySelector(".info-box-unit").innerText = dataInfo[box.dataset.quantity].unit;
                break;
            default:
                continue
        }
    }
}

// Updates only the VALUE for every info box
function updateAllInfoBoxValues() {
    //get HTMLCollection of text spans for each value to be displayed
    const infoBoxes = document.querySelectorAll('.info-box');

    for (let box of infoBoxes)
        //update text with most recent value from global variable
        box.querySelector(".info-box-value").innerText = currentData[box.dataset.label];
}

/****************************
 * CHART BOX DROPDOWN STUFF *
 ****************************/

function chartDropdownHandler(e) {
    //required info
    const oldId = e.target.parentNode.querySelector(".chart-container").id;
    const oldValue = oldId.split('-')[0]; //disgusting hardcoded way of getting 'value' from 'value-chart'
    const newValue = e.target.value;
    const newId = newValue + '-chart';
    const selectedChartAlreadyExists = document.querySelector('#' + newValue + '-chart') != null;

    // console.log(oldId, newValue, selectedChartAlreadyExists);

    if (selectedChartAlreadyExists) {

        console.log('[*] Selected chart already exists, swapping charts...');

        //destroy old charts before swapping
        charts[oldValue].destroy();
        charts[newValue].destroy();

        //delete old chart objects linked to old DOM object
        delete charts[oldValue];
        delete charts[newValue];

        //swap ID's
        //need to get the DOM elements first to have a consistent reference to 
        //... each object after changing the id
        let oldChart = document.getElementById(oldId);
        let newChart = document.getElementById(newId);

        [oldChart.id, newChart.id] = [newId, oldId]; //swap in place

        //update title of new chart (doesn't auto update as it wasnt selected)
        newChart.parentNode.querySelector('select[name="charts"]').value = oldValue;

        //recreate the charts with swapped ID's
        charts[newValue] = new ApexCharts(document.querySelector('#' + newId), datasets[newValue].options);
        charts[oldValue] = new ApexCharts(document.querySelector('#' + oldId), datasets[oldValue].options);

        //render new charts
        charts[newValue].render();
        charts[oldValue].render();

        //display new charts
        charts[newValue].updateSeries([{data: datasets[newValue].data}])
        charts[oldValue].updateSeries([{data: datasets[oldValue].data}])

    } else { // dont need to check anything, can just change it
        //destroy old chart
        charts[oldValue].destroy();

        delete charts[oldValue]; //only keep active charts in the charts object

        //update flags
        datasets[oldValue].active = false;
        datasets[newValue].active = true;

        //change container id
        e.target.parentNode.querySelector(".chart-container").id = newId;

        //create the new chart
        charts[newValue] = new ApexCharts(document.querySelector('#' + newId), datasets[newValue].options);

        //render new chart
        charts[newValue].render();

        //display new chart
        charts[newValue].updateSeries([{data: datasets[newValue].data}])
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

// Selects each dropdown list title on the numeric telemetry and flight stats pages
let infoBoxDropdowns = document.querySelectorAll("select[name='numeric-telemetry'], select[name='flight-stats']");
// Selects each dropdown list title on the live telemetry graphs page
let chartDropdowns = document.querySelectorAll("select[name='charts']");

// Adds an event listener to teach dropdown menu that will trigger when a new value is selected 
Array.from(infoBoxDropdowns, dropdown => dropdown.addEventListener("change", infoBoxDropdownHandler));
// Add an event handler to each dropdown to trigger on value change
Array.from(chartDropdowns, dropdown => dropdown.addEventListener("change", chartDropdownHandler));

// Create all chart objects
init();
// Draw the charts
render();