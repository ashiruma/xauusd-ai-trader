# ==============================================================================
# VELARION MARKETS - WINDOWS VPS AUTOMATED SETUP SCRIPT
# ==============================================================================
# Run from PowerShell in the repository root directory:
#   powershell -ExecutionPolicy Bypass -File deploy\vps\setup_vps.ps1
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  VELARION MARKETS - WINDOWS VPS SETUP & PRE-FLIGHT VERIFICATION" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Verify Working Directory
$repoRoot = (Get-Item -Path ".").FullName
if (-not (Test-Path "$repoRoot\service.py") -or -not (Test-Path "$repoRoot\api\app.py")) {
    Write-Host "[ERROR] Must be executed from the repository root directory." -ForegroundColor Red
    Write-Host "Current directory: $repoRoot" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Repository root verified: $repoRoot" -ForegroundColor Green

# 2. Verify Python 64-bit Installation
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "[ERROR] Python is not installed or not in system PATH." -ForegroundColor Red
    Write-Host "Please install Python 3.10+ (64-bit) from https://www.python.org/downloads/windows/" -ForegroundColor Yellow
    exit 1
}

$pyVersion = & python --version 2>&1
$is64Bit = & python -c "import struct; print(struct.calcsize('P') * 8)" 2>&1
if ($is64Bit -ne "64") {
    Write-Host "[ERROR] Detected 32-bit Python ($pyVersion). MetaTrader 5 requires 64-bit Python." -ForegroundColor Red
    Write-Host "Please install Python 64-bit to communicate with terminal64.exe." -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Python verified: $pyVersion (64-bit)" -ForegroundColor Green

# 3. Locate MetaTrader 5 Terminal
$mt5Paths = @(
    "C:\Program Files\MetaTrader 5\terminal64.exe",
    "C:\Program Files\JustMarkets MT5\terminal64.exe",
    "C:\Program Files (x86)\MetaTrader 5\terminal64.exe",
    "$env:ProgramFiles\MetaTrader 5\terminal64.exe"
)

$foundMt5Path = $null
foreach ($path in $mt5Paths) {
    if (Test-Path $path) {
        $foundMt5Path = $path
        break
    }
}

if ($foundMt5Path) {
    Write-Host "[OK] MetaTrader 5 Terminal located at: $foundMt5Path" -ForegroundColor Green
} else {
    Write-Host "[WARNING] terminal64.exe not found in standard paths." -ForegroundColor Yellow
    Write-Host "Ensure JustMarkets MT5 is installed before starting live execution." -ForegroundColor Yellow
}

# 4. Create Runtime Directories
$dirs = @("data", "logs", "deploy\vps")
foreach ($d in $dirs) {
    if (-not (Test-Path "$repoRoot\$d")) {
        New-Item -ItemType Directory -Path "$repoRoot\$d" -Force | Out-Null
        Write-Host "[OK] Created directory: $d" -ForegroundColor Green
    }
}

# 5. Initialize Python Virtual Environment (.venv)
$venvPath = "$repoRoot\.venv"
if (-not (Test-Path "$venvPath\Scripts\activate.ps1")) {
    Write-Host "Creating Python virtual environment (.venv)..." -ForegroundColor Cyan
    & python -m venv "$venvPath"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to create virtual environment." -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] Virtual environment present: $venvPath" -ForegroundColor Green

# 6. Install VPS Dependencies
$venvPython = "$venvPath\Scripts\python.exe"
$reqFile = "$repoRoot\deploy\vps\requirements-vps.txt"
if (Test-Path $reqFile) {
    Write-Host "Upgrading pip and installing production dependencies..." -ForegroundColor Cyan
    & $venvPython -m pip install --upgrade pip --quiet
    & $venvPython -m pip install -r "$reqFile" --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] pip install returned code $LASTEXITCODE. Retrying..." -ForegroundColor Yellow
        & $venvPython -m pip install -r "$reqFile"
    } else {
        Write-Host "[OK] Dependencies installed successfully." -ForegroundColor Green
    }
}

# 7. Configure Production Environment (.env)
if (-not (Test-Path "$repoRoot\.env")) {
    Copy-Item "$repoRoot\deploy\vps\vps.env.example" "$repoRoot\.env"
    Write-Host "[OK] Created .env from deploy\vps\vps.env.example" -ForegroundColor Green
    Write-Host "     IMPORTANT: Edit .env to set your VELARION_INTERNAL_API_KEY and risk limits." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Existing .env file found." -ForegroundColor Green
}

# 8. Test MetaTrader 5 Python Bridge
Write-Host "Running MT5 pre-flight connection check..." -ForegroundColor Cyan
$testScript = @"
import sys
try:
    import MetaTrader5 as mt5
    print('MT5_MODULE: OK')
    initialized = mt5.initialize()
    if initialized:
        acc = mt5.account_info()
        login = acc.login if acc else 'None'
        server = acc.server if acc else 'None'
        print(f'MT5_CONNECTION: OK (Account: #{login} on {server})')
        mt5.shutdown()
    else:
        err = mt5.last_error()
        print(f'MT5_CONNECTION: FAILED ({err})')
except Exception as e:
    print(f'MT5_ERROR: {e}')
"@

$testResult = & $venvPython -c $testScript 2>&1
foreach ($line in $testResult) {
    if ($line -like "*MT5_MODULE: OK*") {
        Write-Host "[OK] MetaTrader5 Python module verified." -ForegroundColor Green
    } elseif ($line -like "*MT5_CONNECTION: OK*") {
        Write-Host "[OK] $line" -ForegroundColor Green
    } elseif ($line -like "*MT5_CONNECTION: FAILED*") {
        Write-Host "[INFO] $line (Start the MT5 terminal and log into JustMarkets to connect)" -ForegroundColor Yellow
    } else {
        Write-Host "     $line" -ForegroundColor Gray
    }
}

# 9. Verify FastApi Application Import
$apiTest = & $venvPython -c "from api.app import app; print('FASTAPI: OK')" 2>&1
if ($apiTest -like "*FASTAPI: OK*") {
    Write-Host "[OK] FastAPI Trading Engine verified and importable." -ForegroundColor Green
} else {
    Write-Host "[ERROR] FastAPI import test failed: $apiTest" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  VPS ENVIRONMENT SETUP COMPLETE!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open your JustMarkets MT5 terminal, ensure 'Algo Trading' is GREEN." -ForegroundColor White
Write-Host "2. Start the resilient daemon by running:" -ForegroundColor White
Write-Host "   deploy\vps\start_daemon.bat" -ForegroundColor Cyan
Write-Host "3. To auto-start on Windows reboot, run:" -ForegroundColor White
Write-Host "   powershell -ExecutionPolicy Bypass -File deploy\vps\install_autostart_task.ps1" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
