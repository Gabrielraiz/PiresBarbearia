@echo off
echo Starting PiresQK Barbearia in DEV mode...
echo.
echo Client: http://localhost:5173
echo Server: http://localhost:3001
echo.
cd /d "%~dp0"
start "PiresQK Server" cmd /k "node server/server.js"
timeout /t 2 /nobreak >nul
start "PiresQK Client" cmd /k "cd client && npm run dev"
echo.
echo Both server and client are starting...
echo Open http://localhost:5173 in your browser
pause
