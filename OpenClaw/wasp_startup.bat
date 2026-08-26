@echo off
title WARLORD MISSION CONTROL - MASTER IGNITION
color 0E

:: ===================================================
:: BUILD TRUE STEALTH INJECTOR
:: ===================================================
set "STEALTH=%temp%\warlord_stealth.vbs"
echo Set WshShell = WScript.CreateObject("WScript.Shell") > "%STEALTH%"
echo WshShell.Run WScript.Arguments(0), 0, False >> "%STEALTH%"

echo ===================================================
echo [WARLORD SYSTEM SEQUENCE INITIATED]
echo ===================================================
echo.

:: STEP 0: ZERO-STATE PORT PURGE (GHOST ERADICATION)
echo [0/6] Sweeping network ghosts and clearing ports...
taskkill /f /im node.exe >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :8081') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :18789') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak >nul

:: STEP 1: OLLAMA LOCAL INFERENCE ENGINE (GHOST MODE)
echo [1/6] Starting Ollama Local Engine (Port 11434)...
wscript "%STEALTH%" "ollama serve"
timeout /t 3 /nobreak >nul

:: STEP 2: OPENCLAW GATEWAY
echo [2/6] Initializing OpenClaw Gateway (Port 18789)...
powershell -Command "Start-ScheduledTask -TaskName 'OpenClaw Gateway' -ErrorAction SilentlyContinue"
timeout /t 3 /nobreak >nul

:: STEP 3: HERMES EXECUTIVE CORE (GHOST MODE)
echo [3/6] Initializing Hermes Executive Core...
wscript "%STEALTH%" "cmd.exe /c cd /d C:\Warlord_Inc\Warlord_WASP\OpenClaw && boot_hermes.bat"
timeout /t 3 /nobreak >nul

:: STEP 4: JACK - MCNC UI & WEBSOCKET BRIDGE (MINIMIZED TERMINAL)
echo [4/6] Launching Jack Server (UI Port 3000, WS Port 8081)...
start "JACK SERVER" /min cmd.exe /k "cd /d C:\Warlord_Inc\Warlord_WASP\MCNC && node server.js"
timeout /t 4 /nobreak >nul

:: STEP 5: MCNC MASTER DASHBOARD & HUD (MINIMIZED TERMINAL)
echo [5/6] Launching Master Dashboard and Diagnostic HUD...
start chrome "http://localhost:3000"
timeout /t 3 /nobreak >nul
start "WASP HUD" /min /d "C:\Warlord_Inc" wasp_status.bat

:: STEP 6: FINAL WASP DOCS MEMORY VAULT (OBSIDIAN)
echo [6/6] Launching Final WASP Docs Obsidian Vault...
start "" "obsidian://open?vault=Final%%20WASP%%20Docs"
timeout /t 3 /nobreak >nul

echo.
echo ===================================================
echo [MASTER SEQUENCE COMPLETE - AWAITING STATUS VERIFICATION]
echo ===================================================
timeout /t 2 >nul
exit /b 0