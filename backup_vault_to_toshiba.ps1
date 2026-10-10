<#
================================================================================
 MCNC BASE 1 // AUTOMATED VAULT BACKUP & COLD STORAGE MIRROR
 Target: TOSHIBA EXT (E:\)
 Scope: vault, MCNC\vault, souls, WASP Documents, and WASP Artwork
 Excludes: node_modules, .git, cache, and runtime temp files
================================================================================
#>

$TargetDriveLetter = "E:"
$BackupDestinationRoot = "E:\Warlord_Cold_Archive"
$SourceRoot = "C:\Warlord_Inc\Warlord_WASP"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[MCNC BACKUP] Checking status of external backup drive..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$Drive = Get-PSDrive -Name ($TargetDriveLetter.TrimEnd(':')) -ErrorAction SilentlyContinue
if (-not $Drive) {
    Write-Host "[ERROR] Target drive $TargetDriveLetter is not mounted or disconnected." -ForegroundColor Red
    Write-Host "[ABORT] Connect the Toshiba external drive and retry." -ForegroundColor Red
    exit 1
}

Write-Host "[MOUNT CONFIRMED] Target volume mounted at $TargetDriveLetter ($([math]::Round($Drive.Free / 1GB, 2)) GB Free)" -ForegroundColor Green

$DirectoriesToBackup = @(
    @{ Source = "$SourceRoot\vault";               Dest = "$BackupDestinationRoot\root_vault" },
    @{ Source = "$SourceRoot\MCNC\vault";          Dest = "$BackupDestinationRoot\MCNC\vault" },
    @{ Source = "$SourceRoot\MCNC\souls";          Dest = "$BackupDestinationRoot\MCNC\souls" },
    @{ Source = "$SourceRoot\WASP Documents";      Dest = "$BackupDestinationRoot\WASP Documents" },
    @{ Source = "$SourceRoot\WASP Artwork";        Dest = "$BackupDestinationRoot\WASP Artwork" }
)

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$LogDirectory = "$BackupDestinationRoot\_Logs"
if (-not (Test-Path -Path $LogDirectory)) {
    New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null
}
$LogFile = "$LogDirectory\Backup_Log_$Timestamp.txt"

$ExcludeDirs = @("node_modules", ".git", ".obsidian\cache", "dist", ".cache")
$ExcludeFiles = @("*.tmp", "*.bak_*", "thumbs.db", ".DS_Store")

$TotalErrors = 0

foreach ($Task in $DirectoriesToBackup) {
    $Src = $Task.Source
    $Dst = $Task.Dest

    if (-not (Test-Path -Path $Src)) {
        continue
    }

    $LeafName = Split-Path -Path $Src -Leaf
    Write-Host "`n[MIRRORING] $Src" -ForegroundColor Yellow
    Write-Host "         -> $Dst" -ForegroundColor DarkGray

    $RoboParams = @(
        $Src,$Dst,
        "/MIR",
        "/FFT",
        "/Z",
        "/R:2",
        "/W:2",
        "/MT:8",
        "/XD"
    ) + $ExcludeDirs + @("/XF") + $ExcludeFiles + @("/LOG+:$LogFile", "/NP", "/NDL")

    & robocopy.exe @RoboParams | Out-Null
    $ExitCode =$LASTEXITCODE

    if ($ExitCode -le 7) {
        Write-Host "[SUCCESS] Synchronized: $LeafName" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Robocopy reported errors on: $LeafName (Exit code:$ExitCode)" -ForegroundColor Red
        $TotalErrors++
    }
}

$TelemetryFile = "$SourceRoot\MCNC\vault\telemetry\active_telemetry.md"
if (Test-Path -Path $TelemetryFile) {$LogEntry = "`n- [$((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))] **COLD_STORAGE_BACKUP**: Synced vault assets to $TargetDriveLetter (Errors: $TotalErrors)."
    Add-Content -Path $TelemetryFile -Value $LogEntry -Encoding utf8
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($TotalErrors -eq 0) {
    Write-Host "[STATUS] Cold archive sync completed successfully without errors." -ForegroundColor Green
} else {
    Write-Host "[STATUS] Completed with $TotalErrors warning(s). Check: $LogFile" -ForegroundColor Yellow
}
Write-Host "Log saved: $LogFile" -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan