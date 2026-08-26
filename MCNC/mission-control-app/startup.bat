@echo off
start "" npm run dev > startup.log 2>&1
:waitloop
timeout /t 2 > nul
findstr /c:"ready - started server on" startup.log
if not errorlevel 1 (
    echo SERVER ONLINE: Ready at http://localhost:3000
    goto :eof
)
goto :waitloop