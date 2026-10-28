@echo off
setlocal
title ECartline Full-Stack Launcher (Java Backend + React Frontend)
color 0A

echo ========================================================
echo       ECARTLINE FULL-STACK LAUNCHER
echo   (Spring Boot Java Backend + React.js Frontend)
echo ========================================================
echo.

:: 1. Check XAMPP MySQL port 3306
echo [1/3] Checking MySQL database on port 3306...
netstat -ano | findstr :3306 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0E
    echo [WARNING] MySQL service was NOT detected on port 3306!
    echo Please make sure MySQL (XAMPP / MariaDB) is started.
    echo.
) else (
    echo [OK] MySQL is active on port 3306.
)

:: 2. Launch Spring Boot Java Backend in a separate window
echo [2/3] Launching Java Spring Boot Backend (Port 3000)...
start "ECartline Java Backend (Port 3000)" cmd /c "%~dp0run-backend.bat"

:: Wait 3 seconds for Tomcat initialization
timeout /t 3 /nobreak >nul

:: 3. Launch React Frontend in a separate window
echo [3/3] Launching React.js Frontend (Port 5173)...
start "ECartline React Frontend (Port 5173)" cmd /c "%~dp0run-frontend.bat"

:: 4. Open default browser
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================================
echo  ECartline is running!
echo    - Frontend: http://localhost:5173
echo    - Backend API: http://localhost:3000/api
echo    - Backend Health: http://localhost:3000/api/health
echo ========================================================
echo Both backend and frontend windows have been opened.
echo Keep those windows open while using ECartline.
echo.
pause
