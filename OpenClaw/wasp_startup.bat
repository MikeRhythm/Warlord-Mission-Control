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
echo [0/7] Sweeping network ghosts and clearing ports...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im voicebox.exe >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :8081') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :18789') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :17493') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak >nul

:: STEP 1: OLLAMA LOCAL INFERENCE ENGINE (GHOST MODE)
echo [1/7] Starting Ollama Local Engine (Port 11434)...
wscript "%STEALTH%" "ollama serve"
timeout /t 3 /nobreak >nul

:: STEP 2: OPENCLAW GATEWAY
echo [2/7] Initializing OpenClaw Gateway (Port 18789)...
powershell -Command "Start-ScheduledTask -TaskName 'OpenClaw Gateway' -ErrorAction SilentlyContinue"
timeout /t 3 /nobreak >nul

:: STEP 3: HERMES EXECUTIVE CORE (GHOST MODE)
echo [3/7] Initializing Hermes Executive Core...
wscript "%STEALTH%" "cmd.exe /c cd /d C:\Warlord_Inc\Warlord_WASP\OpenClaw && boot_hermes.bat"
timeout /t 3 /nobreak >nul

:: STEP 4: JACK - MCNC UI & WEBSOCKET BRIDGE (VISIBLE TERMINAL)
echo [4/7] Launching Jack Server (UI Port 3000, WS Port 8081)...
start "JACK SERVER" cmd.exe /k "cd /d C:\Warlord_Inc\Warlord_WASP\.openclaw\.openclaw\workspace\MCNC && node server.js"
timeout /t 4 /nobreak >nul

:: STEP 5: CHARLIE - OFFLINE VOICEBOX ENGINE (GHOST MODE)
echo [5/7] Launching Voicebox Engine (Port 17493)...
wscript "%STEALTH%" "C:\Users\MikeT\AppData\Local\Voicebox\voicebox.exe"
timeout /t 6 /nobreak >nul

:: STEP 6: MCNC MASTER DASHBOARD & HUD
echo [6/7] Launching Master Dashboard and Diagnostic HUD...
start chrome "http://localhost:3000"
timeout /t 3 /nobreak >nul
start "WASP HUD" /d "C:\Warlord_Inc" wasp_status.bat

:: STEP 7: MONTY'S MEMORY VAULT (OBSIDIAN)
echo [7/7] Launching Monty's Obsidian Vault...
start "" "obsidian://open?vault=Monty"
timeout /t 3 /nobreak >nul

echo.
echo ===================================================
echo [MASTER SEQUENCE COMPLETE - AWAITING STATUS VERIFICATION]
echo ===================================================
timeout /t 2 >nul
exit /b 0