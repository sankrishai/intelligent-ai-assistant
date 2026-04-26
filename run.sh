#!/bin/bash

# Ensure we exit on any command failure
set -e

echo "======================================"
echo "🚀 Starting Intelligent QA AI Assistant"
echo "======================================"

# 1. Build the Frontend
echo "\n[1/2] Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Setup and Run the Backend
echo "\n[2/2] Starting Python Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Start the unified Uvicorn server
echo "Starting Uvicorn server on http://localhost:8000..."
python3 -m uvicorn server:app --reload --port 8000
