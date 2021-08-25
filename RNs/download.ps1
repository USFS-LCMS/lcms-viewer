$url = "https://artifactory.fdc.fs.usda.gov/artifactory/application-release-local/gov/usda/fs/busops/GTAC/lcms-viewer/lcms-viewer.1.0.108.zip"
$output = "C:\Users\azharkikh\Documents\projects\landscape-change-data-explorer\RNs\lcms-viewer.1.0.108.zip"
$start_time = Get-Date
Import-Module BitsTransfer
Start-BitsTransfer -Source $url -Destination $output
Write-Output "Time taken: $((Get-Date).Subtract($start_time).Seconds) second(s)"
