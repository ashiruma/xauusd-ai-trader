@echo off
title XAUUSD Quantitative Trading Server
cd /d "%~dp0"
echo Starting XAUUSD Quantitative Trading Server...
echo Web Dashboard will be available at: http://127.0.0.1:8000/
python run.py serve
pause
