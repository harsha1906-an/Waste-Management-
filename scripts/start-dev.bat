@echo off
REM Local Vendor Platform - Start All Services (Windows)

echo ===============================================================
echo    Starting Local Vendor Platform
echo ===============================================================
echo.

REM Start Backend in new window
echo Starting Backend API...
start "Backend API" cmd /k "cd /d "%~dp0..\backend" && npm run dev"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Frontend in new window
echo Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0..\frontend" && npm run dev"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start ML Service in new window
echo Starting ML Service...
start "ML Service" cmd /k "cd /d "%~dp0..\ml-service" && venv\Scripts\activate && python app.py"

echo.
echo ===============================================================
echo    All Services Started!
echo ===============================================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend:     http://localhost:3000
echo ML Service:   http://localhost:8000
echo.
echo Press any key to exit...
pause >nul
