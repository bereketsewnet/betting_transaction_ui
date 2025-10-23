@echo off
REM Betting Payment Manager - Quick Setup Script (Windows)
REM This script will set up your development environment

echo ============================================
echo  Betting Payment Manager - Quick Setup
echo ============================================
echo.

REM Step 1: Check Node.js
echo [Step 1] Checking Node.js version...
node -v
if errorlevel 1 (
    echo    ERROR: Node.js not found!
    echo    Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
echo    OK: Node.js is installed
echo.

REM Step 2: Check .env file
echo [Step 2] Checking environment file...
if exist .env (
    echo    OK: .env file exists
) else (
    echo    WARNING: .env file not found
    if exist .env.example (
        echo    Creating .env from .env.example...
        copy .env.example .env >nul
        echo    OK: Created .env file
        echo    NOTE: Please update .env with your backend URL
    ) else (
        echo    Creating default .env file...
        (
            echo # API Configuration
            echo VITE_API_BASE_URL=http://localhost:3000/api/v1
            echo VITE_SOCKET_URL=http://localhost:3000
            echo.
            echo # App Configuration
            echo VITE_APP_NAME=Betting Payment Manager
            echo VITE_APP_VERSION=1.0.0
            echo.
            echo # Upload Configuration
            echo VITE_MAX_FILE_SIZE=8388608
            echo VITE_ALLOWED_FILE_TYPES=image/png,image/jpeg,image/jpg
            echo.
            echo # Pagination Defaults
            echo VITE_DEFAULT_PAGE_SIZE=10
        ) > .env
        echo    OK: Created default .env file
    )
)
echo.

REM Step 3: Install dependencies
echo [Step 3] Installing dependencies...
if exist node_modules (
    echo    node_modules exists. Checking for updates...
    npm install
) else (
    echo    Installing packages (this may take a few minutes)...
    npm install
)
if errorlevel 1 (
    echo    ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo    OK: Dependencies installed
echo.

REM Step 4: Verify type definitions
echo [Step 4] Verifying type definitions...
if exist src\vite-env.d.ts (
    echo    OK: Environment types exist
) else (
    echo    WARNING: Environment types missing
)

if exist src\types\css-modules.d.ts (
    echo    OK: CSS module types exist
) else (
    echo    WARNING: CSS module types missing
)
echo.

REM Step 5: Check TypeScript
echo [Step 5] Checking TypeScript configuration...
npx tsc --noEmit >nul 2>&1
if errorlevel 1 (
    echo    WARNING: TypeScript errors found
    echo    Run 'npx tsc --noEmit' to see details
) else (
    echo    OK: No TypeScript errors
)
echo.

REM Summary
echo ============================================
echo  Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Ensure backend API is running at http://localhost:3000
echo 2. Update .env if needed
echo 3. Run: npm run dev
echo 4. Open: http://localhost:5173
echo.
echo Documentation:
echo    - README.md - Full documentation
echo    - QUICK_START.md - Quick start guide
echo    - TROUBLESHOOTING.md - Fix common issues
echo    - FIXES_APPLIED.md - Recent fixes
echo.
echo Happy coding!
echo.
pause

