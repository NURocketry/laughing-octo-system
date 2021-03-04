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
