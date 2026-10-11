# package_deployment.ps1 - Package Gulf HR Production Build for cPanel Server

$ErrorActionPreference = "Stop"

$workspaceRoot = "e:\hrsolution"
$stagingDir = "$workspaceRoot\build_server_staging"
$zipOutput = "$workspaceRoot\hr_trackmyteam_us_deployment.zip"

Write-Host "1. Cleaning staging directory..."
if (Test-Path $stagingDir) {
    Remove-Item -Path $stagingDir -Recurse -Force
}
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

Write-Host "2. Building latest frontend production bundle..."
Set-Location "$workspaceRoot\frontend"
npm run build
Set-Location $workspaceRoot

Write-Host "3. Copying dist assets..."
Copy-Item -Path "$workspaceRoot\frontend\dist\index.html" -Destination "$workspaceRoot\index.html" -Force
Copy-Item -Path "$workspaceRoot\frontend\dist\assets\*" -Destination "$workspaceRoot\assets\" -Force
Copy-Item -Path "$workspaceRoot\frontend\dist\BAHRAIN_SMART_CARD_SETUP_GUIDE.html" -Destination "$workspaceRoot\BAHRAIN_SMART_CARD_SETUP_GUIDE.html" -Force
if (Test-Path "$workspaceRoot\frontend\dist\downloads") {
    Copy-Item -Path "$workspaceRoot\frontend\dist\downloads" -Destination "$workspaceRoot\downloads" -Recurse -Force
}

Write-Host "4. Staging files for deployment package..."
Copy-Item -Path "$workspaceRoot\index.html" -Destination "$stagingDir\" -Force
Copy-Item -Path "$workspaceRoot\.htaccess" -Destination "$stagingDir\" -Force
Copy-Item -Path "$workspaceRoot\api.php" -Destination "$stagingDir\" -Force
Copy-Item -Path "$workspaceRoot\favicon.svg" -Destination "$stagingDir\" -Force
Copy-Item -Path "$workspaceRoot\icons.svg" -Destination "$stagingDir\" -Force
Copy-Item -Path "$workspaceRoot\BAHRAIN_SMART_CARD_SETUP_GUIDE.html" -Destination "$stagingDir\" -Force
Copy-Item -Path "$workspaceRoot\download_bridge.php" -Destination "$stagingDir\" -Force

Copy-Item -Path "$workspaceRoot\assets" -Destination "$stagingDir\" -Recurse -Force
Copy-Item -Path "$workspaceRoot\api" -Destination "$stagingDir\" -Recurse -Force
Copy-Item -Path "$workspaceRoot\backend" -Destination "$stagingDir\" -Recurse -Force
if (Test-Path "$workspaceRoot\downloads") {
    Copy-Item -Path "$workspaceRoot\downloads" -Destination "$stagingDir\" -Recurse -Force
}

# Clean any cache or temporary files in staging backend
if (Test-Path "$stagingDir\backend\.git") { Remove-Item "$stagingDir\backend\.git" -Recurse -Force }
Get-ChildItem -Path "$stagingDir" -Include "*.log", "*.tmp" -Recurse | Remove-Item -Force

Write-Host "5. Creating zip archive: $zipOutput..."
if (Test-Path $zipOutput) {
    Remove-Item $zipOutput -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($stagingDir, $zipOutput, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$zipItem = Get-Item $zipOutput
Write-Host "=========================================="
Write-Host "SUCCESS: Deployment Zip Created!"
Write-Host "Path: $($zipItem.FullName)"
Write-Host "Size: $([math]::Round($zipItem.Length / 1KB, 2)) KB ($($zipItem.Length) bytes)"
Write-Host "=========================================="

# Clean up staging
Remove-Item -Path $stagingDir -Recurse -Force
