@echo off
setlocal enabledelayedexpansion
title Velarion Markets - Live MT5 Trading Daemon

cd /d "%~dp0..\.."

echo ======================================================================
echo   VELARION MARKETS - 24/7 LIVE MT5 EXECUTION DAEMON
echo ======================================================================
echo Current Working Directory: %CD%

:: 1. Ensure logs directory exists
if not exist "logs" mkdir "logs"

:: 2. Check if MetaTrader 5 Terminal is Running
echo Checking MetaTrader 5 process (terminal64.exe)...
tasklist /fi "imagename eq terminal64.exe" | find /i "terminal64.exe" >nul
if errorlevel 1 (
    echo MetaTrader 5 is not currently running. Attempting to start...
    if exist "C:\Program Files\MetaTrader 5\terminal64.exe" (
        start "" "C:\Program Files\MetaTrader 5\terminal64.exe"
        echo Launched MT5 from C:\Program Files\MetaTrader 5\terminal64.exe
        timeout /t 5 /nobreak >nul
    ) else if exist "C:\Program Files\JustMarkets MT5\terminal64.exe" (
        start "" "C:\Program Files\JustMarkets MT5\terminal64.exe"
        echo Launched MT5 from C:\Program Files\JustMarkets MT5\terminal64.exe
        timeout /t 5 /nobreak >nul
    ) else (
        echo [WARNING] terminal64.exe not found in default paths.
        echo Please ensure JustMarkets MT5 is running before trades execute.
    )
) else (
    echo [OK] MetaTrader 5 terminal process is running.
)

:: 3. Select Python Interpreter (.venv or system)
set "PYTHON_EXE=python"
if exist ".venv\Scripts\python.exe" (
    set "PYTHON_EXE=.venv\Scripts\python.exe"
    echo [OK] Using virtual environment: .venv\Scripts\python.exe
) else (
    echo [INFO] Using system python interpreter.
)

:: 4. Resilient Crash-Recovery Loop
:DAEMON_LOOP
echo.
echo [%DATE% %TIME%] Starting Uvicorn FastAPI Server on port 8000...
echo Logging output to logs\daemon.log...
echo.

"%PYTHON_EXE%" -m uvicorn api.app:app --host 127.0.0.1 --port 8000 >> "logs\daemon.log" 2>&1

set EXIT_CODE=%ERRORLEVEL%
echo.
echo ======================================================================
echo [CRASH RECOVERY] Daemon stopped with exit code %EXIT_CODE% at %DATE% %TIME%
echo Restarting trading daemon in 5 seconds... Press Ctrl+C to cancel.
echo ======================================================================
echo [%DATE% %TIME%] Daemon crashed or stopped with code %EXIT_CODE% >> "logs\daemon_crashes.log"

timeout /t 5 /nobreak >nul
goto DAEMON_LOOP
