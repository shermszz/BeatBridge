#!/bin/bash

# BeatBridge Netlify Deployment Script

echo "🚀 Starting BeatBridge deployment to Netlify..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the beatbridge-frontend directory"
    exit 1
fi

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Check if user is logged in to Netlify
if ! netlify status &> /dev/null; then
    echo "🔐 Please log in to Netlify..."
    netlify login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed! Please check the build logs."
    exit 1
fi

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=build

echo "✅ Deployment complete!"
echo "🌐 Your site should be live at the URL shown above."
echo ""
echo "💡 Tips:"
echo "   - Set up environment variables in your Netlify dashboard"
echo "   - Configure your custom domain if needed"
echo "   - Check the deployment logs if you encounter issues" 