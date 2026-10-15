@echo off
title XAUUSD Paper Trading Loop
cd /d "%~dp0"
echo Starting real-time paper trading loop for XAUUSD...
python run.py paper
pause
