#
# Database migration script for Budget Tracker (Windows PowerShell)
#
# Usage:
#   # Run migrations
#   .\run-migrations.ps1
#
#   # Show migration status
#   .\run-migrations.ps1 -Status
#
#   # Run with custom database path
#   $env:DATABASE_URL="sqlite:///C:/path/to/db.sqlite"; .\run-migrations.ps1
#

param(
    [switch]$Status,
    [switch]$Downgrade,
    [switch]$StampHead,
    [switch]$Help
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Default database URL
$DefaultDbUrl = "sqlite:///$ProjectRoot/data/budget_tracker.db"

function Show-Help {
    Write-Host "Database Migration Script for Budget Tracker"
    Write-Host ""
    Write-Host "Usage: .\run-migrations.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Status        Show current migration status"
    Write-Host "  -Downgrade     Downgrade one revision"
    Write-Host "  -StampHead     Stamp database with current head (for existing DBs)"
    Write-Host "  -Help          Show this help message"
    Write-Host ""
    Write-Host "Environment Variables:"
    Write-Host "  DATABASE_URL    Database connection URL"
    Write-Host "                  Default: $DefaultDbUrl"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  # Run migrations"
    Write-Host "  .\run-migrations.ps1"
    Write-Host ""
    Write-Host "  # Show status"
    Write-Host "  .\run-migrations.ps1 -Status"
}

if ($Help) {
    Show-Help
    exit 0
}

Set-Location $ScriptDir

# Set default DATABASE_URL if not set
if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = $DefaultDbUrl
}

Write-Host "Database: $env:DATABASE_URL"
Write-Host ""

$args = @()
if ($Status) {
    $args += "--status"
} elseif ($Downgrade) {
    $args += "--downgrade"
} elseif ($StampHead) {
    $args += "--stamp-head"
}

try {
    uv run python migrate.py @args
} catch {
    Write-Host "Migration failed: $_" -ForegroundColor Red
    exit 1
}

