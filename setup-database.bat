@echo off
title ECartline Database Setup
color 0B

echo ========================================================
echo         ECARTLINE XAMPP DATABASE SETUP / SEED
echo ========================================================
echo.
echo Make sure MySQL is started in XAMPP Control Panel.
echo.

cd /d "%~dp0ECartline\backend"
call npm run setup

echo.
echo ========================================================
echo Database setup finished!
echo Admin account: admin@ecartline.in / Admin@12345
echo ========================================================
pause
