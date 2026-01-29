@echo off
REM Local Vendor Platform - Windows Setup Script
REM This script sets up the entire development environment on Windows

echo ===============================================================
echo    Local Vendor Platform - Development Setup (Windows)
echo ===============================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js 20+
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js: %NODE_VERSION%
)

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found. Please install Python 3.11+
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo [OK] Python: %PYTHON_VERSION%
)

REM Check PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] PostgreSQL client not found. Make sure PostgreSQL is installed.
) else (
    for /f "tokens=*" %%i in ('psql --version') do set PSQL_VERSION=%%i
    echo [OK] PostgreSQL: %PSQL_VERSION%
)

echo.
echo Installing dependencies...
echo.

REM Install Frontend dependencies
echo [1/3] Installing Frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..

REM Install Backend dependencies
echo.
echo [2/3] Installing Backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)
echo [OK] Backend dependencies installed
cd ..

REM Install ML Service dependencies
echo.
echo [3/3] Installing ML Service dependencies...
cd ml-service
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install ML service dependencies
    exit /b 1
)
echo [OK] ML Service dependencies installed
call deactivate
cd ..

echo.
echo ===============================================================
echo    Setup Complete!
echo ===============================================================
echo.
echo To start development:
echo.
echo Terminal 1 - Backend:
echo   cd backend ^&^& npm run dev
echo.
echo Terminal 2 - Frontend:
echo   cd frontend ^&^& npm run dev
echo.
echo Terminal 3 - ML Service:
echo   cd ml-service ^&^& venv\Scripts\activate ^&^& python app.py
echo.
echo Or use Docker:
echo   docker-compose up
echo.
pause
