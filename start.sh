#!/bin/bash

echo "🚀 Component Generator Platform - Quick Start"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH."
    echo "   Please install MongoDB and make sure it's running."
fi

echo "📦 Installing dependencies..."
npm run install:all

echo "🔧 Setting up environment..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
    echo "⚠️  Please edit backend/.env and add your AI API key"
else
    echo "✅ backend/.env already exists"
fi

echo "🎯 Starting the application..."
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📝 Don't forget to:"
echo "   1. Add your OpenAI or OpenRouter API key to backend/.env"
echo "   2. Make sure MongoDB is running"
echo "   3. (Optional) Start Redis for caching"
echo ""

npm run dev