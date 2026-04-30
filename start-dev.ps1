param(
    [switch]$SkipDocker
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiProject = Join-Path $root "src\EventFlow.Api"
$webProject = Join-Path $root "web"

if (-not $SkipDocker) {
    Write-Host "Subindo dependencias com Docker Compose..."
    & docker compose up -d
}

Write-Host "Iniciando API em nova janela..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$apiProject'; dotnet run"
)

Write-Host "Iniciando frontend em nova janela..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$webProject'; npm run dev"
)

Write-Host ""
Write-Host "API: http://localhost:5217"
Write-Host "Web: http://localhost:3000"
Write-Host "RabbitMQ: http://localhost:15672"
