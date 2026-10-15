@echo off
title XAUUSD Quantitative Backtest
cd /d "%~dp0"
echo Running 15-day event-driven backtest for XAUUSD...
python run.py backtest --days 15
pause
