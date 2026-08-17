@echo off
setlocal enabledelayedexpansion
title PU-HUB Launcher
cd /d "%~dp0"

echo ================================================
echo    PU-HUB - Pensa UENR Hub launcher
echo    Postgres check - seed - backend :8000 - frontend :5173
echo ================================================
echo.

REM ---------------- 1. PostgreSQL ----------------
echo [1/4] PostgreSQL
set "PG_FOUND=0"
for %%S in (postgresql-x64-17 postgresql-x64-16 postgresql-x64-15 postgresql-x64-14 postgresql-x64-13 postgresql) do (
    sc query "%%S" >nul 2>&1
    if not errorlevel 1 (
        sc start "%%S" >nul 2>&1
        set "PG_FOUND=1"
        echo   - Found %%S - attempting to start it. "already running" is fine.
        goto pg_done
    )
)
:pg_done
if "%PG_FOUND%"=="0" echo   - No PostgreSQL service detected. Please start Postgres manually.

REM ---------------- 2. Seed demo accounts ----------------
echo.
echo [2/4] Seeding demo accounts
cd /d "%~dp0backend"
if not exist ".venv\Scripts\python.exe" (
    echo   ERROR: backend\.venv not found. Run these first:
    echo     cd backend
    echo     python -m venv .venv
    echo     .venv\Scripts\pip install -r requirements.txt
    echo     .venv\Scripts\pip install email-validator
    goto frontend
)

set "SEEDED=0"
for /l %%i in (1,1,10) do (
    echo   - Attempt %%i/10
    ".venv\Scripts\python.exe" seed.py
    if !errorlevel! equ 0 (
        set "SEEDED=1"
        goto seed_done
    )
    echo   - Database not ready yet - retrying in 3s
    timeout /t 3 /nobreak >nul
)
:seed_done
if "%SEEDED%"=="0" echo   WARNING: Could not reach the database after 10 tries.

REM ---------------- 3. Backend API ----------------
:frontend
echo.
echo [3/4] Backend API on port 8000
curl -s -m 2 http://localhost:8000/health >nul 2>&1
if !errorlevel! equ 0 (
    echo   - Already running - skipping.
) else (
    echo   - Launching uvicorn in a new window.
    start "PU-HUB Backend" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\python -m uvicorn app.main:app --port 8000"
)

REM ---------------- 4. Frontend ----------------
echo.
echo [4/4] Frontend on port 5173
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo   - Installing npm dependencies - first run, this takes a moment.
    call npm install
)
curl -s -m 2 http://localhost:5173/ >nul 2>&1
if !errorlevel! equ 0 (
    echo   - Already running - skipping.
) else (
    echo   - Launching Vite dev server in a new window.
    start "PU-HUB Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
)

echo.
echo ================================================
echo   Done - open these:
echo     Frontend   http://localhost:5173
echo     API docs   http://localhost:8000/docs
echo.
echo   Demo accounts - full list in CREDENTIALS.md
echo     Super Admin        admin@puhub.com        / admin123
echo     Admin Students     student.admin@puhub.com / student123
echo     Admin Alumni       alumni.admin@puhub.com / alumni123
echo     Finance Secretary  finance@puhub.com      / finance123
echo     IT Head            it.head@puhub.com      / ithead123
echo ================================================
timeout /t 4 /nobreak >nul
start "" http://localhost:5173
endlocal
