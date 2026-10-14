@echo off
title ECartline Server Launcher
color 0A

echo ========================================================
echo               ECARTLINE E-COMMERCE LAUNCHER
echo ========================================================
echo.

:: 1. Check if Node is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Check XAMPP MySQL port 3306
echo [1/3] Checking XAMPP MySQL on port 3306...
netstat -ano | findstr :3306 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0E
    echo.
    echo [WARNING] MySQL service was NOT detected on port 3306!
    echo Please open XAMPP Control Panel and click [Start] next to MySQL.
    echo.
    set /p CONTINUE="Do you want to continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
) else (
    echo [OK] MySQL is active on port 3306.
)

:: 3. Navigate to backend directory
cd /d "%~dp0ECartline\backend"

:: 4. Verify node_modules
if not exist "node_modules\" (
    echo.
    echo [2/3] Installing dependencies (first time only)...
    call npm install
)

:: 5. Open browser in background after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: 6. Start server
echo.
echo [3/3] Starting ECartline server at http://localhost:3000...
echo Keep this window OPEN while using the website.
echo Press Ctrl + C to stop the server anytime.
echo ========================================================
echo.

npm start
pause
