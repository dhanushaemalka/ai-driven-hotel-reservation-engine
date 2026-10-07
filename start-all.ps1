param(
  [switch]$Install
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $root "server"
$clientDir = Join-Path $root "client"
$aiDir = Join-Path $root "ai-service"

if (!(Test-Path $serverDir) -or !(Test-Path $clientDir) -or !(Test-Path $aiDir)) {
  Write-Host "Required folders not found. Run this script from Hotel_Booking_System root." -ForegroundColor Red
  exit 1
}

function Start-ServiceWindow {
  param(
    [string]$Title,
    [string]$WorkingDirectory,
    [string]$Command
  )

  $escapedDir = $WorkingDirectory.Replace("'", "''")
  $fullCommand = "Set-Location '$escapedDir'; `$host.UI.RawUI.WindowTitle = '$Title'; $Command"
  Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $fullCommand | Out-Null
}

$serverCommand = if ($Install) { "npm install; npm run server" } else { "npm run server" }
$clientCommand = if ($Install) { "npm install; npm run dev" } else { "npm run dev" }
$aiCommand = if ($Install) { "pip install -r requirements.txt; python api_server.py" } else { "python api_server.py" }

Write-Host "Starting Hotel Booking System services..." -ForegroundColor Cyan
Write-Host " - Backend:  http://localhost:3000" -ForegroundColor DarkGray
Write-Host " - Frontend: http://localhost:5173" -ForegroundColor DarkGray
Write-Host " - AI API:   http://localhost:8000" -ForegroundColor DarkGray

Start-ServiceWindow -Title "Hotel API (3000)" -WorkingDirectory $serverDir -Command $serverCommand
Start-ServiceWindow -Title "Hotel Client (5173)" -WorkingDirectory $clientDir -Command $clientCommand
Start-ServiceWindow -Title "Hotel AI (8000)" -WorkingDirectory $aiDir -Command $aiCommand

Write-Host ""
Write-Host "Launched 3 PowerShell windows." -ForegroundColor Green
Write-Host "Use -Install on first run if dependencies are missing:" -ForegroundColor Yellow
Write-Host "  .\start-all.ps1 -Install" -ForegroundColor Yellow
