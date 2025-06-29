#!/bin/bash

# BeatBridge Development Setup Script
echo "🎵 Setting up BeatBridge development environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create virtual environment for Python
echo "🐍 Setting up Python virtual environment..."
cd beatbridge-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "✅ Python dependencies installed"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd ../beatbridge-frontend
npm install
echo "✅ Node.js dependencies installed"

# Create .env file if it doesn't exist
cd ../beatbridge-backend
if [ ! -f .env ]; then
    echo "📝 Creating .env file template..."
    cat > .env << EOF
# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flask_db

# Flask Configuration
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_password
MAIL_DEFAULT_SENDER=your_email@gmail.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Last.fm API (optional)
LASTFM_API_KEY=your_lastfm_api_key
EOF
    echo "✅ .env file created. Please update it with your actual values."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update beatbridge-backend/.env with your actual values"
echo "2. Set up PostgreSQL database"
echo "3. Run the application:"
echo "   - Backend: cd beatbridge-backend && flask run"
echo "   - Frontend: cd beatbridge-frontend && npm start"
echo ""
echo "For detailed instructions, see README.md" 