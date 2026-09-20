@echo off
title WARLORD MISSION CONTROL - SAFE HARD REVERT (MAIN)
color 4F

echo ===================================================
echo [INITIATING SAFE TRACKED-FILE REVERT TO ORIGIN/MAIN]
echo ===================================================
echo Target: C:\Warlord_Inc\Warlord_WASP
echo Branch: main
echo NOTE: Zero untracked files will be touched. No git clean.
echo.

:: STEP 1: KILL ACTIVE PROCESSES TO UNLOCK PORTS & FILES
echo [1/3] Terminating Node processes on Ports 5173, 8080, 8081...
taskkill /f /im node.exe >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :8080') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :8081') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak >nul

:: STEP 2: NAVIGATE TO WARLORD_WASP REPO
echo [2/3] Moving to repository and syncing origin/main...
cd /d "C:\Warlord_Inc\Warlord_WASP"

:: Fetch the latest remote status from GitHub
git fetch origin main

:: Force tracked files back to the exact commit on origin/main
git reset --hard origin/main

echo.
echo [3/3] Revert Complete. Tracked files aligned with GitHub origin/main.
echo ===================================================
timeout /t 3 >nul
exit