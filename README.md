# Summer Project 2020 - Software project - Live data handling

## Quick Start: Running locally
1. Open liveData.html in Chromium 
2. Run server.py 
3. Refresh the page. At present a couple refreshes might be needed

# How to install python


# Install pip

# Compile to single window executable
This project can be compiled to a single windows executable using pyinstaller.
Follow the instruction below to get the exe file.

1. Grab a copy of the project from github. Use git tool `git clone https://github.com/NURocketry/laughing-octo-system`
2. Install pyinstaller using pip, by running `pip install pyinstaller`.
3. Get into the src directory of this project.
4. Make sure you've installed all the dependancies required to run this project.
5. Run the following command in th windows terminal `pyinstaller --onefile --icon="icon.ico" --add-data="client/;client" .\main.py`.
6. In the dist folder will now contain your windows executable file.

Note: Windows defender identifies the compiled executable as a trojan virus. Feel free to inspect our code and come to your own conclusion if this project is
malicious or not. Here the virus inspection https://www.virustotal.com/gui/file/f008cce1945f23f272e36bd2ce967a84780231e78a18817f1a7993daca538ac6/detection.

# Run the project with just python
1. Install python.
2. Project require dependancies use pip to install the following packages:
* asyncio
* websockets
* pyserial
* aiohttp
* aiohttp-jinja2

# Start up the project
## Start recording
1.
2.
3.
## Read from a file
1.
2.
3.
