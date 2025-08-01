@echo off
echo ====================================
echo AI Study Planner Development Setup
echo ====================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo Node.js and npm are available
echo.

:: Install backend dependencies
echo Installing backend dependencies...
cd backend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)

:: Create backend .env file if it doesn't exist
if not exist ".env" (
    echo Creating backend .env file...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please update the .env file with your actual configuration:
    echo - MongoDB connection string
    echo - JWT secret key
    echo - OpenAI API key
    echo - Google OAuth credentials
    echo - Email configuration
    echo.
) else (
    echo Backend .env file already exists
)

cd ..

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)

:: Create frontend .env file if it doesn't exist
if not exist ".env" (
    echo Creating frontend .env file...
    copy .env.example .env
    echo.
    echo Frontend .env file created. Update if needed.
    echo.
) else (
    echo Frontend .env file already exists
)

cd ..

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Update backend/.env with your actual configuration
echo 2. Start MongoDB (if using local instance)
echo 3. Run 'npm run dev' in backend folder to start the API server
echo 4. Run 'npm start' in frontend folder to start the React app
echo.
echo For development with both servers:
echo 1. Open two terminal windows
echo 2. In first terminal: cd backend && npm run dev
echo 3. In second terminal: cd frontend && npm start
echo.
echo The application will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo.
echo For testing:
echo - Backend tests: cd backend && npm test
echo - Frontend tests: cd frontend && npm test
echo.
pause
