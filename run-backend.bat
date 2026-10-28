@echo off
setlocal
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

"%JAVA_HOME%\bin\java.exe" -jar "%~dp0backend-java\target\ecartline-backend-1.0.0.jar"
pause
