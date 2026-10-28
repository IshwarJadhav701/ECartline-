@echo off
setlocal
echo ========================================================
echo   Building ECartline Spring Boot Java Backend with Maven
echo ========================================================

set "JAVA_HOME=%~dp0.tools\jdk-17.0.10+7"
set "MAVEN_HOME=%~dp0.tools\maven"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

cd /d "%~dp0backend-java"
call "%MAVEN_HOME%\bin\mvn.cmd" clean package -DskipTests
cd /d "%~dp0"

echo.
echo Build complete. JAR generated at backend-java\target\ecartline-backend-1.0.0.jar
