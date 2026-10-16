# ==============================================================================
# VELARION MARKETS - WINDOWS TASK SCHEDULER AUTO-START CONFIGURATION
# ==============================================================================
# Configures Windows Task Scheduler to automatically start the MT5 trading daemon
# on VPS boot or user logon with highest available privileges and auto-restart.
#
# Run in Administrator PowerShell:
#   powershell -ExecutionPolicy Bypass -File deploy\vps\install_autostart_task.ps1
# ==============================================================================

param(
    [switch]$Uninstall = $false
)

$taskName = "Velarion-Trading-Daemon"
$repoRoot = (Get-Item -Path ".").FullName
$batPath = "$repoRoot\deploy\vps\start_daemon.bat"

if ($Uninstall) {
    Write-Host "Removing Scheduled Task: $taskName..." -ForegroundColor Cyan
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "[OK] Scheduled task removed." -ForegroundColor Green
    exit 0
}

if (-not (Test-Path $batPath)) {
    Write-Host "[ERROR] Could not find $batPath" -ForegroundColor Red
    exit 1
}

Write-Host "Configuring Windows Scheduled Task: $taskName" -ForegroundColor Cyan

# 1. Action: Launch batch launcher in minimized command shell
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$batPath`"" -WorkingDirectory $repoRoot

# 2. Trigger: Trigger on user logon and at startup
$triggerLogon = New-ScheduledTaskTrigger -AtLogOn
$triggerStartup = New-ScheduledTaskTrigger -AtStartup

# 3. Settings: Indefinite runtime, restart on failure
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Days 365) `
    -RestartCount 5 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -MultipleInstances IgnoreNew

# 4. Principal: Current user with highest execution privilege (Required for MT5 GUI interaction)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest

# 5. Register Task
try {
    # Remove existing task if present
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger @($triggerLogon, $triggerStartup) `
        -Settings $settings `
        -Principal $principal `
        -Description "Velarion Markets 24/7 Live MT5 Execution Daemon & API Bridge" | Out-Null

    Write-Host "[OK] Task '$taskName' registered successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Management Commands:" -ForegroundColor Yellow
    Write-Host "  Start Task Now:   Start-ScheduledTask -TaskName `"$taskName`"" -ForegroundColor White
    Write-Host "  Check Status:     Get-ScheduledTask -TaskName `"$taskName`"" -ForegroundColor White
    Write-Host "  Uninstall Task:   powershell -ExecutionPolicy Bypass -File deploy\vps\install_autostart_task.ps1 -Uninstall" -ForegroundColor White
} catch {
    Write-Host "[ERROR] Failed to register task: $_" -ForegroundColor Red
    Write-Host "Ensure PowerShell is running as Administrator." -ForegroundColor Yellow
}
