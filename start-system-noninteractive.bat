@echo off
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "BACKEND_PORT=5003"
set "FRONTEND_PORT=3001"

cd /d "%BACKEND%"
start "Backend Server" cmd.exe /k "uvicorn app.main:app --host 0.0.0.0 --port %BACKEND_PORT% --reload"
ping 127.0.0.1 -n 3 >nul

cd /d "%ROOT%"
set "VITE_API_BASE=http://127.0.0.1:%BACKEND_PORT%/api/v1"
start "Frontend Server" cmd.exe /k "npm run dev -- --port %FRONTEND_PORT%"
start http://localhost:%FRONTEND_PORT%

