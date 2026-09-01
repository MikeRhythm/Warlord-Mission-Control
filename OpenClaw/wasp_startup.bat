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
echo [0/8] Sweeping network ghosts and clearing ports...
taskkill /f /im node.exe >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :3100') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :8081') do taskkill /f /pid %%a >nul 2>&1
FOR /F "tokens=5" %%a in ('netstat -a -n -o ^| findstr :18789') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak >nul

:: STEP 1: OLLAMA LOCAL INFERENCE ENGINE (GHOST MODE)
echo [1/8] Starting Ollama Local Engine (Port 11434)...
wscript "%STEALTH%" "ollama serve"
timeout /t 3 /nobreak >nul

:: STEP 2: OPENCLAW GATEWAY
echo [2/8] Initializing OpenClaw Gateway (Port 18789)...
powershell -Command "Start-ScheduledTask -TaskName 'OpenClaw Gateway' -ErrorAction SilentlyContinue"
timeout /t 3 /nobreak >nul

:: STEP 3: PAPERCLIP ORCHESTRATION ENGINE (PORT 3100)
echo [3/8] Initializing Paperclip Orchestrator (Port 3100)...
start "PAPERCLIP ORCHESTRATOR" /min cmd.exe /k "cd /d C:\Warlord_Inc\Warlord_WASP && paperclipai run"
timeout /t 4 /nobreak >nul

:: STEP 4: HERMES EXECUTIVE CORE (GHOST MODE)
echo [4/8] Initializing Hermes Executive Core...
wscript "%STEALTH%" "cmd.exe /c cd /d C:\Warlord_Inc\Warlord_WASP\OpenClaw && boot_hermes.bat"
timeout /t 3 /nobreak >nul

:: STEP 5: BASE 1 BACKEND & MONTY DAEMON (PORT 3000)
echo [5/8] Launching Base 1 Backend Server (Port 3000)...
start "BASE 1 BACKEND" /min cmd.exe /k "cd /d C:\Warlord_Inc\Warlord_WASP\MCNC && node server.js"
timeout /t 3 /nobreak >nul

:: STEP 6: MCNC V2 FRONTEND CLIENT (VITE PORT 5173)
echo [6/8] Launching MCNC V2 React Interface (Port 5173)...
start "MCNC V2 FRONTEND" /min cmd.exe /k "cd /d C:\Warlord_Inc\Warlord_WASP\MCNC_V2 && npm run dev"
timeout /t 4 /nobreak >nul

:: STEP 7: MCNC MASTER DASHBOARD & HUD
echo [7/8] Launching Master Dashboard in Chrome and Diagnostic HUD...
start chrome "http://localhost:5173"
timeout /t 3 /nobreak >nul
if exist "C:\Warlord_Inc\wasp_status.bat" (
    start "WASP HUD" /min /d "C:\Warlord_Inc" wasp_status.bat
)

:: STEP 8: FINAL WASP DOCS MEMORY VAULT (OBSIDIAN)
echo [8/8] Launching Final WASP Docs Obsidian Vault...
start "" "obsidian://open?vault=Final%%20WASP%%20Docs"
timeout /t 3 /nobreak >nul

echo.
echo ===================================================
echo [MASTER SEQUENCE COMPLETE - ALL DAEMONS SYNCHRONIZED]
echo ===================================================
timeout /t 2 >nul
exit /b 0