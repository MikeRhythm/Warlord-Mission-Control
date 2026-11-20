@echo off
TITLE WARLORD WASP // COLD START ORCHESTRATOR
COLOR 0A

echo ============================================================================
echo   WARLORD WASP // COLD BOOT SEQUENCE INITIATED
echo   SYSTEM TIME : %DATE% %TIME%
echo ============================================================================
echo.

:: 1. KILL LINGERING PORT CONFLICTS & OLD TUNNELS
echo [0/6] Purging stale port processes (8081, 8082, 8085, 5173) and old tunnels...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8082') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8085') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1
timeout /t 1 /nobreak >nul

:: 2. VERIFY OLLAMA (HERMES 3) LOCAL LLM ENGINE
echo [1/6] Checking Ollama Engine (Port 11434)...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Ollama offline. Launching background Ollama server...
    start "OLLAMA ENGINE" /min ollama serve
    timeout /t 2 /nobreak >nul
) else (
    echo [OK] Ollama Engine is already online.
)

:: 3. LAUNCH PILLAR 1: MCNC CORE API & AUTH GATEWAY (PORT 8081)
echo [2/6] Starting MCNC Core Server & Auth API (Port 8081)...
start "PILLAR 1 - MCNC CORE API 8081" /D "C:\Warlord_Inc\Warlord_WASP\MCNC" cmd /k "node server.js"
timeout /t 2 /nobreak >nul

:: 4. LAUNCH PILLAR 2: MCNC PIPELINE ENGINE (PORT 8082)
echo [3/6] Starting Pipeline Engine (Port 8082)...
start "PILLAR 2 - PIPELINE ENGINE 8082" /D "C:\Warlord_Inc\Warlord_WASP\MCNC" cmd /k "node server_pipeline.js"
timeout /t 2 /nobreak >nul

:: 5. LAUNCH PILLAR 4: WARLORD MAIL GATEWAY (PORT 8085)
echo [4/6] Starting Warlord Mail Gateway (Port 8085)...
start "PILLAR 4 - MAIL GATEWAY 8085" /D "C:\Warlord_Inc\Warlord_WASP\MCNC" cmd /k "node services\mail_gateway.js"
timeout /t 2 /nobreak >nul

:: 6. LAUNCH FRONTEND: REACT VITE DASHBOARD (PORT 5173)
echo [5/6] Starting MCNC Vite Dashboard (Port 5173)...
start "MCNC DASHBOARD - VITE 5173" /D "C:\Warlord_Inc\Warlord_WASP\MCNC_V2" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

:: 7. LAUNCH PILLAR 5: CLOUDFLARE PUBLIC HTTPS TUNNEL
echo [6/6] Starting Cloudflare Remote Access Tunnel...
if exist "C:\Warlord_Inc\Warlord_WASP\MCNC\cloudflared.exe" (
    start "PILLAR 5 - CLOUDFLARE HTTPS TUNNEL" /D "C:\Warlord_Inc\Warlord_WASP\MCNC" cmd /k "cloudflared.exe tunnel --url http://127.0.0.1:5173 --logfile C:\Warlord_Inc\Warlord_WASP\MCNC\cloudflared.log"
) else (
    echo [!] cloudflared.exe not found in MCNC folder - skipping remote tunnel.
)

echo.
echo ============================================================================
echo   [OK] ALL WARLORD WASP SUBSYSTEMS DEPLOYED & MONITORED
echo   - Local LLM Triage  : http://localhost:11434
echo   - Core Auth & API   : http://localhost:8081
echo   - Backend Pipeline  : http://localhost:8082
echo   - Mail Gateway      : http://localhost:8085
echo   - Executive Front   : http://localhost:5173
echo   - Remote Tunnel     : Check "PILLAR 5 - CLOUDFLARE HTTPS TUNNEL" window
echo ============================================================================
echo.
timeout /t 5
