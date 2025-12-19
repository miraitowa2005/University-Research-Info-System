# Set console to UTF-8 to prevent garbled characters
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}
try { $PSDefaultParameterValues['*:Encoding'] = 'utf8' } catch {}

# --- Main Script ---

Write-Host '=======================================================' -ForegroundColor Yellow
Write-Host '     University Research Info System - Startup' -ForegroundColor Yellow
Write-Host '=======================================================' -ForegroundColor Yellow
Write-Host ''

# Get script paths
$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendRoot = $PSScriptRoot
$BackendRoot = Join-Path $PSScriptRoot 'backend'

Set-Location $PSScriptRoot

# 1. Environment Checks
Write-Host '[1/5] Checking for Node.js and npm...' -ForegroundColor Cyan
$nodePath = Get-Command node -ErrorAction SilentlyContinue
$npmPath = Get-Command npm -ErrorAction SilentlyContinue
if (-not $nodePath -or -not $npmPath) {
    Write-Host '[ERROR] Node.js and/or npm not found. Please install them.' -ForegroundColor Red
    pause
    exit 1
}

# 2. Install Dependencies
Write-Host '[2/5] Checking and installing dependencies...' -ForegroundColor Cyan
# Frontend
if (-not (Test-Path (Join-Path $FrontendRoot 'node_modules'))) {
    Write-Host '  [INFO] Installing dependencies for Frontend...' -ForegroundColor Gray
    Push-Location $FrontendRoot
    npm install --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) {
        Write-Host '[ERROR] Frontend dependency installation failed.' -ForegroundColor Red
        Pop-Location
        pause
        exit 1
    }
    Pop-Location
}
# Backend
if (-not (Test-Path (Join-Path $BackendRoot 'node_modules'))) {
    Write-Host '  [INFO] Installing dependencies for Backend...' -ForegroundColor Gray
    Push-Location $BackendRoot
    npm install --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) {
        Write-Host '[ERROR] Backend dependency installation failed.' -ForegroundColor Red
        Pop-Location
        pause
        exit 1
    }
    Pop-Location
}

# 3. Configure Backend (.env and DB)
Write-Host '[3/5] Configuring backend and creating database...' -ForegroundColor Cyan
$envContent = "DB_DIALECT=mysql`nDB_HOST=127.0.0.1`nDB_PORT=3306`nDB_NAME=research_db`nDB_USER=root`nDB_PASS=@LYMoa4pta8w`nDB_LOGGING=true"
Set-Content -Path (Join-Path $BackendRoot '.env') -Value $envContent

Push-Location $BackendRoot
Write-Host "  [INFO] Running 'npm run db:create'..." -ForegroundColor Gray
npm run db:create
Pop-Location

# 4. Find Available Port for Backend
Write-Host '[4/5] Finding an available port for the backend...' -ForegroundColor Cyan
$BackendPort = 5000
while (Get-NetTCPConnection -LocalPort $BackendPort -State Listen -ErrorAction SilentlyContinue) {
    Write-Host "  [INFO] Port $BackendPort is in use, trying next port..." -ForegroundColor Gray
    $BackendPort++
}
Write-Host "  [INFO] Backend will use port $BackendPort." -ForegroundColor Gray

# 5. Start Services
Write-Host '[5/5] Starting backend and frontend services in new windows...' -ForegroundColor Cyan

# Start Backend
$backendCommand = "cd '$BackendRoot';`$env:PORT='$BackendPort'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

# Start Frontend
$frontendApiUrl = "http://127.0.0.1:$BackendPort/api"
$frontendCommand = "cd '$FrontendRoot';`$env:VITE_API_BASE='$frontendApiUrl'; npm run dev -- --port 3000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host ''
Write-Host '[SUCCESS] Launched Backend and Frontend in new windows.' -ForegroundColor Green
Write-Host "  - Backend API should be running at: http://127.0.0.1:$BackendPort"
Write-Host "  - Frontend should be running at: http://localhost:3000"
Write-Host ''
