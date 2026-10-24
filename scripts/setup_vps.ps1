# ==============================================================================
# Velarion XAUUSD - Automated 24/7 Windows VPS Provisioning & Deployment Script
# ==============================================================================
# Run this script on your Windows Server VPS (London LD4) inside PowerShell
# as Administrator.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\setup_vps.ps1
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$SkipServiceInstall = $false
)

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " VELARION XAUUSD - 24/7 WINDOWS VPS PROVISIONING & SETUP" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Administrator Elevation Check
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[WARN] This script is not running as Administrator." -ForegroundColor Yellow
    Write-Host "[WARN] Service installation may require Administrator privileges." -ForegroundColor Yellow
    Write-Host "[WARN] Recommend right-clicking PowerShell and selecting 'Run as Administrator'." -ForegroundColor Yellow
}

# 2. Project Directory Resolution
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot
Write-Host "[INFO] Working directory set to: $projectRoot" -ForegroundColor Gray

# 3. Python Verification
Write-Host "`n[STEP 1/5] Checking Python Runtime..." -ForegroundColor Yellow
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "[ERROR] Python was not found on system PATH." -ForegroundColor Red
    Write-Host "[INFO] Please download and install Python 3.11 (64-bit) from https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "[IMPORTANT] Ensure you check 'Add python.exe to PATH' during installation!" -ForegroundColor Yellow
    exit 1
}

$pyVersion = python --version 2>&1
Write-Host "[OK] Detected: $pyVersion at $($pythonCmd.Source)" -ForegroundColor Green

# 4. Dependency Installation
Write-Host "`n[STEP 2/5] Installing Python Dependencies..." -ForegroundColor Yellow
Write-Host "[INFO] Upgrading pip..." -ForegroundColor Gray
python -m pip install --upgrade pip --quiet

Write-Host "[INFO] Installing core packages from requirements.txt..." -ForegroundColor Gray
python -m pip install -r requirements.txt

Write-Host "[INFO] Installing native Windows MetaTrader 5 interface..." -ForegroundColor Gray
python -m pip install MetaTrader5>=5.0.45 --quiet

# Verify MT5 import
$mt5Check = python -c "import MetaTrader5; print('MT5 version:', MetaTrader5.__version__)" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] $mt5Check" -ForegroundColor Green
} else {
    Write-Host "[WARN] MetaTrader5 library installation warning: $mt5Check" -ForegroundColor Yellow
}

# 5. Database Schema Initialization
Write-Host "`n[STEP 3/5] Initializing SQLite Trade Database..." -ForegroundColor Yellow
python -c "from data.storage import db; print('[OK] Database ready at: ' + db.db_path)"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Database initialization failed." -ForegroundColor Red
    exit 1
}

# 6. Environment Configuration (.env)
Write-Host "`n[STEP 4/5] Checking Environment Configuration (.env)..." -ForegroundColor Yellow
$envPath = Join-Path $projectRoot ".env"
$envExamplePath = Join-Path $projectRoot ".env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Host "[INFO] Created fresh .env from .env.example." -ForegroundColor Green
    } else {
        New-Item -ItemType File -Path $envPath -Force | Out-Null
        Add-Content -Path $envPath -Value "TRADING_MODE=LIVE"
        Add-Content -Path $envPath -Value "DATA_MODE=LIVE_MT5"
        Add-Content -Path $envPath -Value "MT5_SYMBOL=XAUUSD.m"
        Add-Content -Path $envPath -Value "MT5_LOGIN="
        Add-Content -Path $envPath -Value "MT5_PASSWORD="
        Add-Content -Path $envPath -Value "MT5_SERVER=JustMarkets-Live"
        Write-Host "[INFO] Created template .env file." -ForegroundColor Green
    }
    Write-Host "[ACTION REQUIRED] Edit $envPath with your live JustMarkets account credentials!" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Existing .env file detected at: $envPath" -ForegroundColor Green
}

# 7. MetaTrader 5 Terminal Path Auto-Detection
Write-Host "`n[STEP 5/5] Checking MetaTrader 5 Terminal Installation..." -ForegroundColor Yellow
$mt5Paths = @(
    "C:\Program Files\JustMarkets MetaTrader 5\terminal64.exe",
    "C:\Program Files\MetaTrader 5\terminal64.exe",
    "C:\Program Files (x86)\JustMarkets MetaTrader 5\terminal.exe",
    "$env:LOCALAPPDATA\Programs\MetaTrader 5\terminal64.exe"
)

$detectedMT5 = $null
foreach ($path in $mt5Paths) {
    if (Test-Path $path) {
        $detectedMT5 = $path
        break
    }
}

if ($detectedMT5) {
    Write-Host "[OK] Found MT5 Terminal at: $detectedMT5" -ForegroundColor Green
} else {
    Write-Host "[WARN] MT5 terminal64.exe was not detected in standard program directories." -ForegroundColor Yellow
    Write-Host "[INFO] If installed in a custom location, ensure MT5 is running or set MT5_PATH in .env" -ForegroundColor Gray
}

# 8. Create Standalone Batch Launchers
$startTraderBat = Join-Path $projectRoot "scripts\start_live_trader.bat"
$startDashboardBat = Join-Path $projectRoot "scripts\start_dashboard.bat"

$traderBatContent = @"
@echo off
title Velarion XAUUSD - Live 24/7 Trading Engine
cd /d "%~dp0\.."
echo ==============================================================
echo VELARION XAUUSD - AUTONOMOUS TRADING ENGINE (24/7 LIVE)
echo ==============================================================
python -m execution.live_trader
pause
"@

$dashboardBatContent = @"
@echo off
title Velarion XAUUSD - Telemetry and Risk Dashboard
cd /d "%~dp0\.."
echo ==============================================================
echo VELARION XAUUSD - TELEMETRY DASHBOARD (PORT 8000)
echo ==============================================================
uvicorn api.server:app --host 0.0.0.0 --port 8000
pause
"@

Set-Content -Path $startTraderBat -Value $traderBatContent -Encoding ASCII
Set-Content -Path $startDashboardBat -Value $dashboardBatContent -Encoding ASCII
Write-Host "[OK] Created launcher: scripts\start_live_trader.bat" -ForegroundColor Green
Write-Host "[OK] Created launcher: scripts\start_dashboard.bat" -ForegroundColor Green

# 9. Windows 24/7 Background Scheduled Task Setup
if (-not $SkipServiceInstall -and $isAdmin) {
    Write-Host "`n[SERVICE] Configuring 24/7 Auto-Start Task (Windows Task Scheduler)..." -ForegroundColor Yellow
    $taskName = "Velarion_XAUUSD_LiveTrader"
    $pythonPath = (Get-Command python).Source
    $action = New-ScheduledTaskAction -Execute $pythonPath -Argument "-m execution.live_trader" -WorkingDirectory $projectRoot
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit 0
    $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest

    try {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal | Out-Null
        Write-Host "[OK] Registered 24/7 background task: '$taskName'" -ForegroundColor Green
        Write-Host "[INFO] The task will auto-start on Windows boot and restart automatically if interrupted." -ForegroundColor Gray
    } catch {
        Write-Host "[WARN] Could not register scheduled task: $_" -ForegroundColor Yellow
        Write-Host "[INFO] You can manually start the trader via scripts\start_live_trader.bat" -ForegroundColor Gray
    }
}

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " SETUP COMPLETE - READY FOR 24/7 LIVE TRADING EXECUTION" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Open .env and insert your real JustMarkets live account credentials." -ForegroundColor White
Write-Host "2. Open MetaTrader 5 and ensure 'Algo Trading' is toggled ON (green icon)." -ForegroundColor White
Write-Host "3. Double-click scripts\start_live_trader.bat to start trading." -ForegroundColor White
Write-Host "4. Double-click scripts\start_dashboard.bat to view live telemetry on port 8000." -ForegroundColor White
Write-Host "======================================================================`n" -ForegroundColor Cyan
