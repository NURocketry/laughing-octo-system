# Live Telemetry Display
As the name implies this is a tool for displaying and replaying collected from our various rocket platforms. 


## Installation
1. Download and install the latest version of python. It can be found [here](https://www.python.org/downloads/). 
2. Open your terminal of choice (Command Prompt, Powershell etc.) and run: `pip install asyncio websockets pyserial aiohttp aiohttp-jinja2 pyinstaller psutil pypng pyqrcode`
3. Download and run the executable from the team's sharepoint server. It can be found [here](). Link not working, will have to compile executable yourself.


## Quick start 

### Program Flow
![Program Flow](/programFlow.jpg)

Image above describes how the program will execute each time.

## CSV / Serial stream data structure
The data must be structured as follows

Time (us), Altitude (m), Velocity (m/s), Acceleration (m/s²), Air temperature (°C), Air pressure (mbar)

This is both for the .csv, where each column is one of the different data types.
The serial stream needs to be a string of the above data types, seperated by a comma ","

### Live Launch
1. Ensure that you have an active serial connection with data that is in the correct format.
2. Run the program installed by the [executable]() and follow the prompts.
3. In the browser of your choice open ![](ws://localhost:8080). 
Note. The program does not have to be running on your machine to the telemetry. Ensure that you are on the same networks as a computer running the program and navigate to [](ws://localhost:8080) 

### Replay Launch
1. Run the program installed by the [executable]() with the file path of the flight to be replayed i.e. `telemetry dist/replay.csv`.
2. In the browser of your choice open ![](ws://localhost:8080). 

## Compiling executable
1. Ensure git is installed. It can be found [here](https://git-scm.com/download/win)
2. Work through the [installation](## Installation). i.e. python installation and pip packages
3. Clone the project: `git clone https://github.com/NURocketry/laughing-octo-system.git`
4. Navigate to the `src` directory of the repository you just cloned i.e. `cd ..\laughing-octo-system\src\`
5. Run the following command: `pyinstaller --onefile --icon="icon.ico" --add-data="client/;client" .\main.py`
6. The dist directory will now contain a runnable executable

## Install cmdline (Windows only)
Enables easier access to the program as you can run the program as a command in command prompt.
E.g telerocket as a command, this makes accessible anywhere in command prompt.


### Steps
1. Generate an exe file using the build instructions in this document.
2. TODO add more instruction to get and set env vars.
3. Add the path of the exe into windows PATH enviroment variables. If you need it applied to all users of the system, admin privellages is required.
4. Restart command prompt.
5. Run telerocket and the program should start.

For more information refer [here](https://origin.geeksforgeeks.org/how-to-add-python-to-windows-path/), use your nurocket dist folder as the folder instead of python folder in this tutorial. 


## How to setup Azure Keys
The azure keys are injected through environment variables, and thus the environment variables need to be set for the injection

Note:  the order of the API keys does not matter, just ensure that both keys are not the same key. The setup only has to be completed once. If you wish to set up the keys for multiple users, you can add the keys to the System variables instead, but it may require Administrator privileges. The azure keys are currently not required, but the implementation for injecting the keys is there for future iterations of the software.
1. Press the windows button, then search for "Environment Variables"
2. Click on it, and in the popup click "Environment Variables" which should be in the bottom right
3. Once open, in the top section named "User vairables for ______", click on "New"
4. There should be a dialog box with "Variable name", enter "NU_ROCKET_AZUREKEY_1" and on the second line add the API key
5. Once both are entered click "Ok"
6. Repeat step 3-4, but use a new "Variable Name" called "NU_ROCKET_AZUREKEY_2" and on the second line, add the other API key
7. Once both fields are completed, click "Ok"
8. The environment variables are now set up, when the program is executed it will read the API keys from the system


##Installing Python
Pytyhon is used to run and execute the code used in this software, python does not need to be installed for running the .exe file specifically, but it is required to build it. We have used and tested with Python 3.8.6 and Python 3.9.1 (any newer version should not have issues). The download link for Python 3.8.6 can be found [here](https://www.python.org/downloads/release/python-386/)

### Installing pip
Once python is installed, you need to install pip to install the packages that have been used in this project.

Installing pip can be completed by typing `py install pip`

Further troubleshooting can be fouynd [here](https://pip.pypa.io/en/stable/installing/)
