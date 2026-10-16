@echo off
title Stop Velarion Trading Daemon

echo Stopping Velarion Markets Trading Daemon...

:: Find and kill processes listening on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Terminating PID: %%a listening on port 8000...
    taskkill /f /pid %%a >nul 2>&1
)

echo [OK] Velarion Trading Daemon stopped.
pause
