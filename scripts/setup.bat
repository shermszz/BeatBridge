@echo off
REM BeatBridge Development Setup Script for Windows
echo 🎵 Setting up BeatBridge development environment...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.11+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Create virtual environment for Python
echo 🐍 Setting up Python virtual environment...
cd beatbridge-backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo ✅ Python dependencies installed

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
cd ..\beatbridge-frontend
npm install
echo ✅ Node.js dependencies installed

REM Create .env file if it doesn't exist
cd ..\beatbridge-backend
if not exist .env (
    echo 📝 Creating .env file template...
    (
        echo # Database Configuration
        echo DB_USER=postgres
        echo DB_PASSWORD=your_password_here
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=flask_db
        echo.
        echo # Flask Configuration
        echo SECRET_KEY=your-secret-key-here
        echo JWT_SECRET_KEY=your-jwt-secret-key-here
        echo.
        echo # Email Configuration
        echo MAIL_SERVER=smtp.gmail.com
        echo MAIL_PORT=587
        echo MAIL_USE_TLS=True
        echo MAIL_USERNAME=your_email@gmail.com
        echo MAIL_PASSWORD=your_email_password
        echo MAIL_DEFAULT_SENDER=your_email@gmail.com
        echo.
        echo # Google OAuth ^(optional^)
        echo GOOGLE_CLIENT_ID=your_google_client_id
        echo GOOGLE_CLIENT_SECRET=your_google_client_secret
        echo.
        echo # Last.fm API ^(optional^)
        echo LASTFM_API_KEY=your_lastfm_api_key
    ) > .env
    echo ✅ .env file created. Please update it with your actual values.
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update beatbridge-backend\.env with your actual values
echo 2. Set up PostgreSQL database
echo 3. Run the application:
echo    - Backend: cd beatbridge-backend ^&^& flask run
echo    - Frontend: cd beatbridge-frontend ^&^& npm start
echo.
echo For detailed instructions, see README.md
pause 