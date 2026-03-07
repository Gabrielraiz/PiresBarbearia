@echo off
echo Building PiresQK Barbearia frontend...
cd /d "%~dp0\client"
npm run build
echo.
echo Build complete! Now run start.bat to start the server.
pause
