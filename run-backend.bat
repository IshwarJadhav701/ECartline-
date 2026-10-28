@echo off
setlocal
title ECartline Spring Boot Java Backend (Port 3000)
echo ========================================================
echo   Starting ECartline Spring Boot Java Backend (Port 3000)
echo ========================================================

set "JAVA_HOME=%~dp0.tools\jdk-17.0.10+7"
set "PATH=%JAVA_HOME%\bin;%PATH%"

if not exist "%JAVA_HOME%\bin\java.exe" (
    echo Error: Java 17 not found in %JAVA_HOME%
    pause
    exit /b 1
)

if not exist "%~dp0backend-java\target\ecartline-backend-1.0.0.jar" (
    echo Building Spring Boot executable JAR...
    call "%~dp0build-backend.bat"
)

:: Free port 3000 if an old or lingering process is still holding it
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo [INFO] Port 3000 is occupied by process PID %%a.
    echo [INFO] Terminating old process PID %%a to free port 3000...
    taskkill /f /pid %%a >nul 2>&1
    timeout /t 1 /nobreak >nul
)

echo [OK] Port 3000 is ready. Launching Spring Boot Java Backend...
"%JAVA_HOME%\bin\java.exe" -jar "%~dp0backend-java\target\ecartline-backend-1.0.0.jar"
pause
