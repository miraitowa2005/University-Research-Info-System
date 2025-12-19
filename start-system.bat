@echo off
chcp 65001 >nul
echo =======================================================
echo      University Research Info System - Startup
echo =======================================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PowerShell is not found. This script requires PowerShell to run.
    pause
    exit /b 1
)

REM Execute the main PowerShell script, bypassing execution policy for the current process
echo [INFO] Handing over to PowerShell script for setup and launch...
echo.
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0start_all.ps1"

echo.
echo =======================================================
echo  Script execution finished. You can close this window.
echo =======================================================
pause