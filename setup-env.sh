#!/bin/bash

# Hues Apply Frontend Environment Setup Script

echo "🚀 Setting up Hues Apply Frontend Environment Variables"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Copy example file
if [ -f "env.example" ]; then
    cp env.example .env
    echo "✅ Created .env file from env.example"
else
    echo "❌ env.example file not found. Please create it first."
    exit 1
fi

echo ""
echo "📝 Please edit the .env file with your actual values:"
echo "   - Backend API URL"
echo "   - Firebase configuration"
echo "   - Other environment-specific settings"
echo ""
echo "🔧 You can edit it with:"
echo "   nano .env"
echo "   # or"
echo "   code .env"
echo ""
echo "🚀 After editing, run:"
echo "   docker-compose up --build"
echo ""
echo "📚 For more information, see DOCKER_README.md"
