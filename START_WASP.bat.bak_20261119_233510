@echo off
TITLE WARLORD WASP // COLD START ORCHESTRATOR
COLOR 0A

echo ============================================================================
echo   WARLORD WASP // COLD BOOT SEQUENCE INITIATED
echo   SYSTEM TIME : %DATE% %TIME%
echo ============================================================================
echo.

:: 1. KILL LINGERING PORT CONFLICTS
echo [0/4] Purging stale port processes (8082, 8085, 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8082') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8085') do taskkill /f /pid %%a >nul 2>&1
timeout /t 1 /nobreak >nul

:: 2. VERIFY OLLAMA (HERMES 3) LOCAL LLM ENGINE
echo [1/4] Checking Ollama Engine (Port 11434)...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Ollama offline. Launching background Ollama server...
    start "OLLAMA ENGINE" /min ollama serve
    timeout /t 2 /nobreak >nul
) else (
    echo [?] Ollama Engine is already online.
)

:: 3. LAUNCH PILLAR 2: MCNC PIPELINE ENGINE (PORT 8082)
echo [2/4] Starting Pipeline Engine (Port 8082)...
start "PILLAR 2 - PIPELINE ENGINE 8082" /D "C:\Warlord_Inc\Warlord_WASP\MCNC" cmd /k "node server_pipeline.js"
timeout /t 2 /nobreak >nul

:: 4. LAUNCH PILLAR 4: WARLORD MAIL GATEWAY (PORT 8085)
echo [3/4] Starting Warlord Mail Gateway (Port 8085)...
start "PILLAR 4 - MAIL GATEWAY 8085" /D "C:\Warlord_Inc\Warlord_WASP\MCNC" cmd /k "node services\mail_gateway.js"
timeout /t 2 /nobreak >nul

:: 5. LAUNCH FRONTEND: REACT VITE DASHBOARD (PORT 5173)
echo [4/4] Starting MCNC Vite Dashboard...
start "MCNC DASHBOARD - VITE" /D "C:\Warlord_Inc\Warlord_WASP\MCNC_V2" cmd /k "npm run dev"

echo.
echo ============================================================================
echo   [?] ALL WARLORD WASP SUBSYSTEMS DEPLOYED & MONITORED
echo   - Local LLM Triage  : http://localhost:11434
echo   - Backend Pipeline  : http://localhost:8082
echo   - Mail Gateway      : http://localhost:8085
echo   - Executive Front   : http://localhost:5173
echo ============================================================================
echo.
timeout /t 5