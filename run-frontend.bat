@echo off
setlocal
title ECartline React Frontend (Port 5173)
echo ========================================================
echo   Starting ECartline React.js Frontend (Port 5173)
echo ========================================================

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    pause
    exit /b 1
)

:: Free port 5173 if an old process is still holding it
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo [INFO] Port 5173 is occupied by process PID %%a.
    echo [INFO] Terminating old process PID %%a to free port 5173...
    taskkill /f /pid %%a >nul 2>&1
    timeout /t 1 /nobreak >nul
)

cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)

echo [OK] Port 5173 is ready. Starting Vite React dev server...
call npm run dev
pause
