@echo off
title ECartline Database Setup
color 0B

echo ========================================================
echo         ECARTLINE XAMPP DATABASE SETUP / SEED
echo ========================================================
echo.
echo Make sure MySQL is started in XAMPP Control Panel on port 3306.
echo.

set "MYSQL_CMD=mysql"
where mysql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "C:\xampp\mysql\bin\mysql.exe" (
        set "MYSQL_CMD=C:\xampp\mysql\bin\mysql.exe"
    )
)

echo Importing ecartline.sql into MySQL...
"%MYSQL_CMD%" -u root -e "CREATE DATABASE IF NOT EXISTS ecartline;" 2>nul
"%MYSQL_CMD%" -u root ecartline < "%~dp0ecartline.sql" 2>nul

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo Database setup finished successfully!
    echo Admin account: admin@ecartline.in / Admin@12345
    echo ========================================================
) else (
    echo.
    echo [NOTE] If MySQL has a custom password, you can import
    echo ecartline.sql using phpMyAdmin:
    echo   1. Open http://localhost/phpmyadmin
    echo   2. Create database 'ecartline'
    echo   3. Click 'Import' and select '%~dp0ecartline.sql'
)
pause
