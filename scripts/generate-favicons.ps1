$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

# Deterministic extraction: preserve the original monogram's pixels and alpha.
# Run manually on Windows when the favicon needs regenerating; the site build
# copies the committed assets and has no image-processing dependency.
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot 'src/public'
$source = [System.Drawing.Bitmap]::new((Join-Path $projectRoot 'logo.PNG'))
$crop = [System.Drawing.Rectangle]::new(109, 234, 803, 415)
$monogram = $source.Clone($crop, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$source.Dispose()

# This crop excludes both wordmark lines and all sparkles. Recolor without
# thresholding, tracing, thickening, or altering the original edge coverage.
for ($y = 0; $y -lt $monogram.Height; $y++) {
    for ($x = 0; $x -lt $monogram.Width; $x++) {
        $alpha = $monogram.GetPixel($x, $y).A
        $monogram.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 238, 202, 212))
    }
}

# Leave the canvas transparent so only the pink UN appears on browser tabs.
$background = [System.Drawing.Color]::Transparent
$iconFrames = @()
foreach ($size in @(16, 32, 48, 192, 512)) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear($background)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $width = $size * 0.90
    $height = $width * $monogram.Height / $monogram.Width
    $destination = [System.Drawing.RectangleF]::new(($size - $width) / 2, ($size - $height) / 2, $width, $height)
    $graphics.DrawImage($monogram, $destination, [System.Drawing.RectangleF]::new(0, 0, $monogram.Width, $monogram.Height), [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.Dispose()

    # Keep the brand RGB exact after interpolation, including translucent edges.
    for ($y = 0; $y -lt $size; $y++) {
        for ($x = 0; $x -lt $size; $x++) {
            $alpha = $bitmap.GetPixel($x, $y).A
            $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 238, 202, 212))
        }
    }

    $stream = [System.IO.MemoryStream]::new()
    $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $stream.ToArray()
    $stream.Dispose()
    $bitmap.Dispose()
    if ($size -ge 48) {
        [System.IO.File]::WriteAllBytes((Join-Path $outputDirectory "favicon-${size}x${size}.png"), $bytes)
    }
    if ($size -le 48) {
        $iconFrames += [PSCustomObject]@{ Size = $size; Bytes = $bytes }
    }
}
$monogram.Dispose()

# Multi-resolution ICO with PNG-encoded 16, 32, and 48 px frames.
$iconStream = [System.IO.MemoryStream]::new()
$writer = [System.IO.BinaryWriter]::new($iconStream)
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]$iconFrames.Count)
$offset = 6 + 16 * $iconFrames.Count
foreach ($frame in $iconFrames) {
    $writer.Write([byte]$frame.Size)
    $writer.Write([byte]$frame.Size)
    $writer.Write([byte]0)
    $writer.Write([byte]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]32)
    $writer.Write([uint32]$frame.Bytes.Length)
    $writer.Write([uint32]$offset)
    $offset += $frame.Bytes.Length
}
foreach ($frame in $iconFrames) { $writer.Write([byte[]]$frame.Bytes) }
$writer.Flush()
[System.IO.File]::WriteAllBytes((Join-Path $outputDirectory 'favicon.ico'), $iconStream.ToArray())
$writer.Dispose()
$iconStream.Dispose()
Write-Output 'Created four transparent favicon assets from logo.PNG (90% width, original proportions).'
