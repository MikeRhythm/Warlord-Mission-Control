@echo off
title WARLORD WASP - HERMES CORE ORCHESTRATOR
echo ========================================================
echo        LAUNCHING HERMES COGNITIVE ORCHESTRATION LAYER
echo ========================================================
echo.

:: 1. Clear any zombie background sessions to ensure zero-state initialization
taskkill /f /im hermes.exe 2>nul

:: 2. Launch your pristine global Windows Hermes 0.17.0 space directly
start "Hermes Engine" cmd /k hermes

:: 3. Launch your local background tools concurrently
echo [+] Syncing local tools (Obsidian Engine & Paperclip Pipeline)...
:: Note: If Obsidian or Paperclip require specific batch files later, we map them here.

echo.
echo ========================================================
echo        WASP ROUTED AND RUNNING ON BASE1
echo ========================================================
timeout /t 5
exit