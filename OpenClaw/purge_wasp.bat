@echo off
title WASP AI SUPA PACK - GLOBAL PURGE
echo ========================================================
echo FORCE-CLEARING ALL FROZEN AUTOMATION ENGINE RUNTIMES...
echo ========================================================

:: 1. Clear core Windows runtimes
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM pnpm.exe /T 2>nul
taskkill /F /IM ollama.exe /T 2>nul

:: 2. Terminate WSL background processes handling Hermes execution
taskkill /F /IM wsl.exe /T 2>nul
taskkill /F /IM wslhost.exe /T 2>nul

echo ========================================================
echo ZERO-STATE INITIALIZATION COMPLETED SAFELY
echo ========================================================
timeout /t 5
exit /b 0