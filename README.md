# Summer Project 2020 - Software project - Live data handling

## Quick Start: Running locally
1. Open liveData.html in Chromium 
2. Run server.py 
3. Refresh the page. At present a couple refreshes might be needed


## TODO
### Working on Windows
Self explanatory. Get to a point where it can run on Microsoft Windows. The
easiest way to do this the springs to mind would be to ensure that the project
is running under [WSL2](https://docs.microsoft.com/en-us/windows/wsl/compare-versions). 
Docker might be another option.

### Axis Labels
The x-axis of the graphs should display the elapsed time, not some arbitrary
number.

### Local Web Server 
A web-server that can run on a local network on site. This can simple be
implemented with the line: 
```
python -m SimpleHTTPServer 8000
```

The main issue that needs to addressed here is at present state the server code
(server.py) needs to be running on any machine where live data needs to be
displayed.  

### Rewrite Numeric Data display
These lines of code should be rewritten to make them more robust
```
//Fix this. Something about this line does not play nicely. Needs to be
//rewritten. Below is a solution. There has to be a more elegant way to
//implement this
//wsValues.map( (val, i) => htmlValues[i].innerText = val);

htmlValues[0].innerText = namedData['velocity'];
htmlValues[1].innerText = namedData['altitude'];
htmlValues[2].innerText = namedData['pressure'];
```

### OBS Feed
This will be 80% done when the Local Web Server is complete. Then this just
amounts to building a bar using HTML, CSS & Javascript that can then be linked
to OBS

### Write data to file
Data that is received from the flight computer should be written to a file.
Format will either be CSV or JSON.

### Ability to review written data
The ability to review data recorded from previous flights.

### Arrangeable Graphs
The ability to arrange graphs. Will need to talk with Tristan to get a better
idea. The idea seems to be akin to a tiling window manager like i3-wm or dwm,
only without the keyboard centric navigation.
