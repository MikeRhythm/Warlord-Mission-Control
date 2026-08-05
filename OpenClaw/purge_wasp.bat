@echo off
title WASP AI SUPA PACK - GLOBAL PURGE
echo ========================================================
echo FORCE-CLEARING ALL FROZEN AUTOMATION ENGINE RUNTIMES...
echo ========================================================

:: 1. Clear core Windows runtimes (Node, Package Managers)
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM pnpm.exe /T >nul 2>&1
taskkill /F /IM npm.cmd /T >nul 2>&1

:: 2. Clear Python runtimes (Backend/Microservices)
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM pythonw.exe /T >nul 2>&1

:: 3. Clear Local LLM Infrastructure
taskkill /F /IM ollama.exe /T >nul 2>&1

:: 4. Terminate WSL background processes handling Hermes execution
taskkill /F /IM wsl.exe /T >nul 2>&1
taskkill /F /IM wslhost.exe /T >nul 2>&1

echo ========================================================
echo ZERO-STATE INITIALIZATION COMPLETED SAFELY
echo ========================================================
timeout /t 3 >nul
exit /b 0