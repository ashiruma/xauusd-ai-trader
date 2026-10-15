Add-Type -AssemblyName System.Drawing

$srcPath = "$PSScriptRoot\..\dashboard\static\velarion_logo.jpg"
$outPngDark = "$PSScriptRoot\..\dashboard\static\velarion_logo_dark.png"
$outPngLight = "$PSScriptRoot\..\dashboard\static\velarion_logo_transparent.png"

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Original Dimensions: $($bmp.Width) x $($bmp.Height)"

# Create a transparent PNG where dark logo pixels become white (#FFFFFF) for dark navbar, and white bg becomes transparent!
$darkBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$transBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $c = $bmp.GetPixel($x, $y)
        $brightness = ($c.R * 0.299 + $c.G * 0.587 + $c.B * 0.114)
        
        # If nearly white (background)
        if ($brightness -gt 240) {
            # Fully transparent
            $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            $transBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            # Alpha based on darkness
            $alpha = [Math]::Min(255, [Math]::Max(0, [int]((255 - $brightness) * 1.2)))
            
            # For dark background website: make pixels crisp white / slightly gold/green tint
            $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 248, 250, 252))
            
            # For transparent original navy
            $transBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        }
    }
}

$darkBmp.Save($outPngDark, [System.Drawing.Imaging.ImageFormat]::Png)
$transBmp.Save($outPngLight, [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
$darkBmp.Dispose()
$transBmp.Dispose()

Write-Host "Successfully generated velarion_logo_dark.png and velarion_logo_transparent.png!"
