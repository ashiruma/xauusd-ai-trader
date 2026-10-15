@echo off
title XAUUSD Automated Test Suite
cd /d "%~dp0"
echo Running 34 automated unit and integration tests...
python -m pytest -v
pause
