# ==============================================================================
# VELARION MARKETS - CLOUDFLARE TUNNEL AUTOMATION FOR WINDOWS VPS
# ==============================================================================
# Installs and configures Cloudflare Tunnel as a persistent Windows Service.
# This exposes http://127.0.0.1:8000 as a secure HTTPS endpoint (e.g. https://gateway.velarionmarkets.com)
# with zero open firewall ports.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File deploy\vps\setup_cloudflare_tunnel.ps1 -TunnelToken "YOUR_CLOUDFLARE_TUNNEL_TOKEN"
# ==============================================================================

param(
    [string]$TunnelToken = ""
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  VELARION MARKETS - CLOUDFLARE TUNNEL VPS SERVICE SETUP" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Check if cloudflared is installed
$cloudflaredCmd = Get-Command cloudflared -ErrorAction SilentlyContinue
$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"

if (-not $cloudflaredCmd -and -not (Test-Path $cloudflaredPath)) {
    Write-Host "cloudflared not detected. Downloading official 64-bit Windows binary..." -ForegroundColor Cyan
    $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi"
    $msiPath = "$env:TEMP\cloudflared.msi"

    Invoke-WebRequest -Uri $downloadUrl -OutFile $msiPath
    Write-Host "Installing cloudflared MSI..." -ForegroundColor Cyan
    Start-Process msiexec.exe -ArgumentList "/i `"$msiPath`" /qn" -Wait
    Remove-Item $msiPath -Force -ErrorAction SilentlyContinue
}

if (Test-Path $cloudflaredPath) {
    $cloudflaredBin = $cloudflaredPath
} elseif ($cloudflaredCmd) {
    $cloudflaredBin = $cloudflaredCmd.Source
} else {
    Write-Host "[ERROR] Could not install cloudflared. Please download manually from Cloudflare." -ForegroundColor Red
    exit 1
}

$cfVersion = & $cloudflaredBin --version 2>&1
Write-Host "[OK] Detected: $cfVersion" -ForegroundColor Green

# 2. Configure Service with Token
if (-not $TunnelToken) {
    Write-Host ""
    Write-Host "No Tunnel Token provided." -ForegroundColor Yellow
    Write-Host "To obtain a persistent Cloudflare Tunnel token:" -ForegroundColor White
    Write-Host "1. Go to https://one.dash.cloudflare.com/ -> Networks -> Tunnels" -ForegroundColor Gray
    Write-Host "2. Click 'Create a tunnel', name it 'velarion-trading-daemon'." -ForegroundColor Gray
    Write-Host "3. Choose Windows environment and copy the tunnel token." -ForegroundColor Gray
    Write-Host "4. Point the public hostname to: http://localhost:8000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then run:" -ForegroundColor White
    Write-Host "  powershell -ExecutionPolicy Bypass -File deploy\vps\setup_cloudflare_tunnel.ps1 -TunnelToken `"YOUR_TOKEN`"" -ForegroundColor Cyan
    exit 0
}

Write-Host "Uninstalling any existing cloudflared Windows service..." -ForegroundColor Cyan
& $cloudflaredBin service uninstall 2>&1 | Out-Null
Start-Sleep -Seconds 2

Write-Host "Installing cloudflared as a Windows Service with provided token..." -ForegroundColor Cyan
& $cloudflaredBin service install $TunnelToken

if ($LASTEXITCODE -eq 0) {
    Start-Sleep -Seconds 1
    Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    Write-Host "[OK] Cloudflare Tunnel installed and running as a persistent Windows Service!" -ForegroundColor Green
    Write-Host "Traffic on your Cloudflare public hostname is now securely routed to http://127.0.0.1:8000" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Service install exited with code $LASTEXITCODE. Attempting to start service..." -ForegroundColor Yellow
    Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
}
