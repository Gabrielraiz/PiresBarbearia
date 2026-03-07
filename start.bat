@echo off
echo Starting PiresQK Barbearia...
echo.
echo Server: http://localhost:3001
echo.
cd /d "%~dp0"
node server/server.js
pause
