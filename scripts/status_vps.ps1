# ==============================================================================
# Velarion XAUUSD - VPS Health and Status Diagnostic Tool
# ==============================================================================
# Usage:
#   powershell -File scripts\status_vps.ps1
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " VELARION XAUUSD - VPS SYSTEM & HEALTH DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Process Checks
Write-Host "`n[1] Checking Active Processes..." -ForegroundColor Yellow

$mt5Proc = Get-Process terminal64, terminal -ErrorAction SilentlyContinue
if ($mt5Proc) {
    Write-Host "[OK] MetaTrader 5 is RUNNING (PID: $($mt5Proc.Id -join ', '))" -ForegroundColor Green
} else {
    Write-Host "[WARN] MetaTrader 5 terminal is NOT detected running." -ForegroundColor Yellow
}

$pythonProcs = Get-CimInstance Win32_Process -Filter "Name LIKE 'python%'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*live_trader*" }
if ($pythonProcs) {
    Write-Host "[OK] Live Trader Engine is ACTIVE (PID: $($pythonProcs.ProcessId -join ', '))" -ForegroundColor Green
} else {
    Write-Host "[WARN] Live Trader Engine process is NOT active." -ForegroundColor Yellow
}

$dashProcs = Get-CimInstance Win32_Process -Filter "Name LIKE 'python%'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*uvicorn*" }
if ($dashProcs) {
    Write-Host "[OK] Dashboard Server is ACTIVE (PID: $($dashProcs.ProcessId -join ', '))" -ForegroundColor Green
} else {
    Write-Host "[INFO] Dashboard Server process is not running (start with scripts\start_dashboard.bat if needed)." -ForegroundColor Gray
}

# 2. Port 8000 Check
Write-Host "`n[2] Checking Network Telemetry Port 8000..." -ForegroundColor Yellow
$portCheck = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "[OK] Port 8000 is LISTENING" -ForegroundColor Green
} else {
    Write-Host "[INFO] Port 8000 is idle" -ForegroundColor Gray
}

# 3. Database Stats
Write-Host "`n[3] Checking Database Storage & Trades..." -ForegroundColor Yellow
python -c "
import os
from data.storage import db

if os.path.exists(db.db_path):
    size_kb = os.path.getsize(db.db_path) / 1024.0
    trades = db.get_all_trades(limit=100)
    print(f'[OK] Database Location: {db.db_path} ({size_kb:.1f} KB)')
    print(f'[OK] Recorded Closed Trades: {len(trades)}')
else:
    print('[WARN] Database file not found.')
"

Write-Host "`n======================================================================" -ForegroundColor Cyan
