@echo off
title OPENCLAW GATEWAY DAEMON [PORT 18789]
color 0A

echo ===================================================
echo [CHARLIE] BYPASSING CRESTODIAN. INITIATING GATEWAY.
echo ===================================================
echo.

:: Force the OpenClaw CLI to launch the Gateway Daemon, not the diagnostic agent
openclaw gateway --port 18789

:: If it drops below this line, the Gateway crashed. We pause to catch the red text.
echo.
echo ===================================================
echo [FATAL ERROR] THE GATEWAY DAEMON CRASHED.
echo ===================================================
pause