Add-Type -AssemblyName System.Drawing

$srcPath = "$PSScriptRoot\..\dashboard\static\velarion_logo.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $c = $bmp.GetPixel($x, $y)
        $brightness = ($c.R * 0.299 + $c.G * 0.587 + $c.B * 0.114)
        if ($brightness -lt 230) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

# Add small 10px padding
$pad = 12
$cropX = [Math]::Max(0, $minX - $pad)
$cropY = [Math]::Max(0, $minY - $pad)
$cropW = [Math]::Min($bmp.Width - $cropX, ($maxX - $minX + 1) + ($pad * 2))
$cropH = [Math]::Min($bmp.Height - $cropY, ($maxY - $minY + 1) + ($pad * 2))

Write-Host "Cropping logo to: X=$cropX, Y=$cropY, W=$cropW, H=$cropH"

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $bmp.Clone($rect, $bmp.PixelFormat)

# Save cropped dark-mode transparent PNG (white artwork on transparent bg)
$darkBmp = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
# Save cropped transparent original navy PNG
$navyBmp = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($x = 0; $x -lt $cropW; $x++) {
    for ($y = 0; $y -lt $cropH; $y++) {
        $c = $cropped.GetPixel($x, $y)
        $brightness = ($c.R * 0.299 + $c.G * 0.587 + $c.B * 0.114)
        if ($brightness -gt 240) {
            $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            $navyBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $alpha = [Math]::Min(255, [Math]::Max(0, [int]((255 - $brightness) * 1.3)))
            # White for dark theme
            $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 248, 250, 252))
            # Original dark navy
            $navyBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        }
    }
}

$darkBmp.Save("$PSScriptRoot\..\dashboard\static\velarion_brand_dark.png", [System.Drawing.Imaging.ImageFormat]::Png)
$navyBmp.Save("$PSScriptRoot\..\dashboard\static\velarion_brand_navy.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Also create just the emblem mark (the "V" symbol) by cropping only the left emblem part!
# The emblem spans approximately the first 35% of the width
$emblemW = [int]($cropW * 0.38)
$emblemRect = New-Object System.Drawing.Rectangle(0, 0, $emblemW, $cropH)
$emblemBmp = $darkBmp.Clone($emblemRect, $darkBmp.PixelFormat)
$emblemBmp.Save("$PSScriptRoot\..\dashboard\static\velarion_emblem_dark.png", [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
$cropped.Dispose()
$darkBmp.Dispose()
$navyBmp.Dispose()
$emblemBmp.Dispose()

Write-Host "Successfully generated velarion_brand_dark.png, velarion_brand_navy.png, and velarion_emblem_dark.png!"
