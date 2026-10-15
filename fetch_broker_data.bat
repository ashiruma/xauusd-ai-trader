@echo off
title XAUUSD Real Broker Data Sync & Backtest
cd /d "%~dp0"
echo ========================================================
echo  Sync Real XAUUSD Broker Data from MetaTrader 5
echo ========================================================
echo.
echo Make sure your MetaTrader 5 terminal is open and logged in.
echo.
python scripts/broker_data_sync.py --bars 5000
pause
