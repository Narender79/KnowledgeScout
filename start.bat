@echo off
echo 🚀 Starting Knowledge Scout Application...

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file and add your GEMINI_API_KEY
    echo    Then run this script again.
    pause
    exit /b 1
)

REM Check if GEMINI_API_KEY is set
findstr /C:"GEMINI_API_KEY=your-gemini-api-key-here" .env >nul
if %errorlevel% equ 0 (
    echo ⚠️  Please set your GEMINI_API_KEY in .env file
    pause
    exit /b 1
)

REM Start the application
echo 🐳 Starting Docker containers...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

echo ✅ Knowledge Scout is running!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo.
echo 👤 Demo Account:
echo    Email: admin@mail.com
echo    Password: admin123
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop app: docker-compose down
pause
