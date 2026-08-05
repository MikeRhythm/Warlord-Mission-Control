@echo off
title WARLORD MISSION CONTROL - MASTER IGNITION
color 0E

echo ===================================================
echo [WARLORD SYSTEM SEQUENCE INITIATED]
echo ===================================================
echo.

:: STEP 1: OLLAMA LOCAL INFERENCE ENGINE
echo [1/6] Starting Ollama Local Engine (Port 11434)...
start "Ollama Engine" /MIN ollama serve
timeout /t 5 /nobreak >nul

:: STEP 2: OPENCLAW GATEWAY (Isolated Execution)
echo [2/6] Initializing OpenClaw Gateway (Port 18789)...
start "OpenClaw Gateway" /MIN /d "C:\Warlord_Inc\Warlord_WASP\OpenClaw" cmd /c "boot_gateway.bat"
timeout /t 25 /nobreak >nul

:: STEP 3: HERMES EXECUTIVE CORE (Isolated Execution)
echo [3/6] Initializing Hermes Executive Core...
start "Hermes Engine" /MIN /d "C:\Warlord_Inc\Warlord_WASP\OpenClaw" cmd /c "boot_hermes.bat"
timeout /t 10 /nobreak >nul

:: STEP 4: JACK - MCNC UI & WEBSOCKET BRIDGE
echo [4/6] Launching Jack Server (UI Port 3000, WS Port 8081)...
start "Jack Server" /MIN /d "C:\Warlord_Inc\Warlord_WASP\.openclaw\.openclaw\workspace\MCNC" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

:: STEP 5: CHARLIE - OFFLINE VOICEBOX ENGINE
echo [5/6] Launching Charlie Voicebox (Port 17493)...
start "Charlie Voicebox" /MIN /d "C:\Warlord_Inc\Warlord_WASP\.openclaw\.openclaw\workspace" cmd /k "python voicebox.py"
timeout /t 5 /nobreak >nul

:: STEP 6: MCNC MASTER DASHBOARD & HUD
echo [6/6] Launching Master Dashboard and Diagnostic HUD...
start "" "http://localhost:3000"
timeout /t 3 /nobreak >nul
start "WASP HUD" /d "C:\Warlord_Inc" wasp_status.bat

echo.
echo ===================================================
echo [MASTER SEQUENCE COMPLETE - AWAITING STATUS VERIFICATION]
echo ===================================================
timeout /t 2 >nul
exit /b 0