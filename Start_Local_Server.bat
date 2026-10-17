@echo off
title Gulf HR Enterprise - Local Development Server
echo ========================================================
echo   Gulf HR Enterprise - Local Stack Launcher
echo ========================================================
echo.
echo [1/2] Starting PHP API Backend Server on http://127.0.0.1:8000 ...
start "Gulf HR Backend (Port 8000)" cmd /k "cd /d %~dp0 && php -S 127.0.0.1:8000 backend/public/index.php"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite Frontend Server on http://localhost:3031 ...
start "Gulf HR Frontend (Port 3031)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo   Application is now LIVE locally!
echo   URL: http://localhost:3031
echo ========================================================
start http://localhost:3031
