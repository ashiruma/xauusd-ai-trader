$viewports = @(
  @{ w = 1920; h = 1080; name = 'navbar_1920.png' },
  @{ w = 1440; h = 900;  name = 'navbar_1440.png' },
  @{ w = 1024; h = 768;  name = 'navbar_1024.png' },
  @{ w = 768;  h = 1024; name = 'navbar_768.png' },
  @{ w = 390;  h = 844;  name = 'navbar_390.png' }
)

$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$baseDir = Get-Location

foreach ($vp in $viewports) {
  $out = Join-Path $baseDir $vp.name
  $dim = "$($vp.w),$($vp.h)"
  $args = @(
    "--headless",
    "--disable-gpu",
    "--user-data-dir=$env:TEMP\edgetest_$($vp.w)",
    "--window-size=$dim",
    "--screenshot=$out",
    "http://localhost:3000"
  )
  Start-Process -FilePath $edgePath -ArgumentList $args -Wait
  $exists = Test-Path $out
  Write-Host "Captured $($vp.name) ($dim): $exists"
}
