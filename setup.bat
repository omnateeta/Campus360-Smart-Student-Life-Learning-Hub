@echo off 
echo Setting up AI Study Planner development environment...
echo.

echo Step 1: Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Step 3: Setting up environment files...
cd ..
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo Created backend\.env file - please update with your configuration
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo Created frontend\.env file - please update with your configuration
)

echo.
echo Setup complete! 
echo.
echo Next steps:
echo 1. Update backend\.env with your MongoDB URI, JWT secret, and API keys
echo 2. Update frontend\.env with your API URL and Google Client ID
echo 3. Start MongoDB service
echo 4. Run 'npm run dev' in the backend directory
echo 5. Run 'npm start' in the frontend directory
echo.
pause
