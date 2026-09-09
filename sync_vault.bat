@echo off
title WARLORD VAULT SYNC - GITHUB PUSH
color 0E

echo ===================================================
echo [INITIATING SECURE GITHUB SYNC]
echo ===================================================
echo.

cd /d "C:\Warlord_Inc\Warlord_WASP"

:: 1. Locate Git Repository
if not exist ".git" (
    echo [NOTICE] Checking MCNC_V2 subdirectory...
    if exist "MCNC_V2\.git" (
        cd /d "C:\Warlord_Inc\Warlord_WASP\MCNC_V2"
    ) else (
        color 0C
        echo [FATAL] Git repository (.git) not found in Warlord_WASP or MCNC_V2!
        pause
        exit /b 1
    )
)

echo [1/4] Staging changes...
git add .

echo [2/4] Inspecting working tree...
:: Only commit if changes are actually staged
git diff-index --quiet --cached HEAD --
if %ERRORLEVEL% NEQ 0 (
    echo [COMMITTING] Writing updates to local Git vault...
    git commit -m "Base 1 Automated Sync: %date% %time%"
) else (
    echo [IDLE] No new file modifications detected. Proceeding to remote check...
)

echo [3/4] Pushing to remote GitHub repository...
for /f "tokens=*" %%b in ('git branch --show-current') do set CURRENT_BRANCH=%%b
if "%CURRENT_BRANCH%"=="" set CURRENT_BRANCH=main

git push origin %CURRENT_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo ===================================================
    echo [PUSH FAILED] Check network, VPN link, or GitHub token!
    echo ===================================================
    powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('GitHub push failed! Check your internet connection or credentials.', 'WARLORD SYNC ERROR', 'OK', [System.Windows.Forms.MessageBoxIcon]::Error);"
    pause
    exit /b 1
)

echo [4/4] Retrieving version hash...
for /f "tokens=*" %%g in ('git rev-parse --short HEAD') do (set "NEW_VERSION=%%g")

echo.
echo ===================================================
echo [SYNC COMPLETE - LOCKED AT COMMIT: %NEW_VERSION% on %CURRENT_BRANCH%]
echo ===================================================

:: Notification Box
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('GitHub push successful! Base 1 Vault locked at version: %NEW_VERSION% on %CURRENT_BRANCH%', 'WARLORD VAULT SYNC', 'OK', [System.Windows.Forms.MessageBoxIcon]::Information);"

timeout /t 3 >nul
exit