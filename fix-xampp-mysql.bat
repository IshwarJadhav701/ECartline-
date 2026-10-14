@echo off
title XAMPP MySQL Quick Fix
color 0E

echo ========================================================
echo             XAMPP MYSQL CRASH / TIMEOUT FIX
echo ========================================================
echo.
echo Closing any frozen mysqld processes...
taskkill /F /IM mysqld.exe >nul 2>nul

echo Cleaning up corrupted temporary XAMPP info files...
del /F /Q "C:\xampp\mysql\data\multi-master.info" >nul 2>nul
del /F /Q "C:\xampp\mysql\data\master-*.info" >nul 2>nul
del /F /Q "C:\xampp\mysql\data\relay-log-*.info" >nul 2>nul

echo.
echo ========================================================
echo Done! Now open XAMPP Control Panel and click [Start] on MySQL.
echo It should start with a green indicator.
echo ========================================================
pause
