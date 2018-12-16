rem @echo off
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" SET BROWSER="%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" SET BROWSER="%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" SET BROWSER=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe

start cmd /K java -jar lib/JsTestDriver.jar --port 9876 --browser %BROWSER%

rem Ping is a hack, causing the batch file to wait for a second before continuing
ping 127.0.0.1 -n 1 -w 1000 > nul

SET JSTESTDRIVER_HOME=lib
jsautotest lib/JsTestDriver.jar
