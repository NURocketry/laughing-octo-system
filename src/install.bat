@echo off
pip install asyncio websockets pyserial aiohttp aiohttp-jinja2 pyinstaller psutil pypng pyqrcode
pyinstaller --onefile --icon="icon.ico" --add-data="client/;client" ./main.py
del .\dist\telerocket.exe
rename %cd%\dist\main.exe telerocket.exe
setx path "%PATH%;%cd%\dist"
echo Suceesful installed, restart command prompt and type in telerocket to run the program.
pause