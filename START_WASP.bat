@echo off
TITLE WARLORD WASP // COLD START ORCHESTRATOR
COLOR 0A

echo ============================================================================
echo   WARLORD WASP // COLD BOOT SEQUENCE INITIATED
echo   SYSTEM TIME : %DATE% %TIME%
echo ============================================================================
echo.

:: 0. HARD CLEANUP: OBSIDIAN, NODE/CLOUDFLARED, CMD/TERMINAL WINDOWS & CHROME TABS
echo [0/6] Closing Obsidian, stale Node/CMD/Terminal instances, and Kaggle/MCNC tabs...
taskkill /f /im Obsidian.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$myPid = $PID; $parentPid = (Get-CimInstance Win32_Process -Filter \"ProcessId=$myPid\").ParentProcessId; " ^
  "Get-Process cmd -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $parentPid } | ForEach-Object { taskkill /f /t /pid $_.Id 2>$null | Out-Null }; " ^
  "Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes, System.Windows.Forms -ErrorAction SilentlyContinue; " ^
  "$root = [System.Windows.Automation.AutomationElement]::RootElement; " ^
  "$chromeWins = $root.FindAll([System.Windows.Automation.TreeScope]::Children, (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ClassNameProperty, 'Chrome_WidgetWin_1'))); " ^
  "foreach ($win in $chromeWins) { " ^
  "  $tabs = $win.FindAll([System.Windows.Automation.TreeScope]::Descendants, (New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty, [System.Windows.Automation.ControlType]::TabItem))); " ^
  "  for ($i = $tabs.Count - 1; $i -ge 0; $i--) { " ^
  "    $t = $tabs.Item($i); $name = $t.Current.Name; " ^
  "    if ($name -match 'Kaggle|Mission Control|MCNC|5173') { " ^
  "      try { " ^
  "        $sel = $t.GetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern); " ^
  "        $sel.Select(); Start-Sleep -Milliseconds 120; " ^
  "        [System.Windows.Forms.SendKeys]::SendWait('^w'); Start-Sleep -Milliseconds 150; " ^
  "      } catch {} " ^
  "    } " ^
  "  } " ^
  "}" >nul 2>&1

timeout /t 1 /nobreak >nul

:: 1. VERIFY OLLAMA (HERMES 3) LOCAL LLM ENGINE
echo [1/6] Checking Ollama Engine (Port 11434)...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Ollama offline. Launching background Ollama server...
    start "OLLAMA ENGINE" /min ollama serve
    timeout /t 2 /nobreak >nul
) else (
    echo [OK] Ollama Engine is already online.
)

:: 2. LAUNCH PILLAR 1: MCNC CORE API & AUTH GATEWAY (PORT 8081)
echo [2/6] Starting MCNC Core Server & Auth API (Port 8081)...
start "PILLAR 1 - MCNC CORE API 8081" /D "C:\Warlord_Inc\Warlord_WASP\MCNC" cmd /k "node server.js"
timeout /t 2 /nobreak >nul

:: 3. LAUNCH PILLAR 2: MCNC PIPELINE ENGINE (PORT 8082)
echo [3/6] Starting Pipeline Engine (Port 8082)...
start "PILLAR 2 - PIPELINE ENGINE 8082" /D "C:\Warlord_Inc\Warlord_WASP\MCNC" cmd /k "node server_pipeline.js"
timeout /t 2 /nobreak >nul

:: 4. LAUNCH PILLAR 4: WARLORD MAIL GATEWAY (PORT 8085)
echo [4/6] Starting Warlord Mail Gateway (Port 8085)...
start "PILLAR 4 - MAIL GATEWAY 8085" /D "C:\Warlord_Inc\Warlord_WASP\MCNC" cmd /k "node services\mail_gateway.js"
timeout /t 2 /nobreak >nul

:: 5. LAUNCH FRONTEND: REACT VITE DASHBOARD (PORT 5173)
echo [5/6] Starting MCNC Vite Dashboard (Port 5173)...
start "MCNC DASHBOARD - VITE 5173" /D "C:\Warlord_Inc\Warlord_WASP\MCNC_V2" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

:: 6. LAUNCH PILLAR 5: CLOUDFLARE PUBLIC HTTPS TUNNEL
echo [6/6] Starting Cloudflare Remote Access Tunnel...
if exist "C:\Warlord_Inc\Warlord_WASP\MCNC\cloudflared.exe" (
    start "PILLAR 5 - CLOUDFLARE HTTPS TUNNEL" /D "C:\Warlord_Inc\Warlord_WASP\MCNC" cmd /k "cloudflared.exe tunnel --url http://127.0.0.1:5173 --logfile C:\Warlord_Inc\Warlord_WASP\MCNC\cloudflared.log"
) else (
    echo [!] cloudflared.exe not found in MCNC folder - skipping remote tunnel.
)

:: 7. LAUNCH MCNC DASHBOARD IN CHROME
echo [7/7] Opening MCNC Dashboard in Chrome (http://localhost:5173)...
start "" "chrome.exe" "http://localhost:5173"

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
