#!/bin/bash

# AISim Nursing Assistant - Startup Script
echo "🏥 Starting AISim Nursing Assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env file exists, create from example if not
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        echo "📝 Creating .env file from example..."
        cp env.example .env
        echo "✅ .env file created"
    else
        echo "⚠️  No .env file found and no example available"
    fi
else
    echo "✅ .env file exists"
fi

# Test Google Gemini API connection
echo "🔗 Testing Google Gemini API connection..."
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
    console.log('❌ GOOGLE_GEMINI_API_KEY not found in environment');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

model.generateContent('Test connection')
    .then(result => {
        console.log('✅ Google Gemini API connection successful');
        process.exit(0);
    })
    .catch(error => {
        console.log('❌ Google Gemini API connection failed:', error.message);
        process.exit(1);
    });
"

if [ $? -ne 0 ]; then
    echo "❌ Google Gemini API test failed. Please check your API key."
    exit 1
fi

# Start the application
echo "🚀 Starting AISim Nursing Assistant server..."
echo "📋 Application will be available at: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start
