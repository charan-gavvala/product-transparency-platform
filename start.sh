#!/bin/bash

# Product Transparency Platform Startup Script

echo "Starting Product Transparency Platform..."

# Check if PostgreSQL is running
echo "Checking PostgreSQL..."
if ! pg_isready -q; then
    echo "ERROR: PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Start Backend
echo "Starting Backend Server..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start AI Service
echo "Starting AI Service..."
cd ai-service
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
python app.py &
AI_SERVICE_PID=$!
cd ..

# Wait for AI service to start
sleep 3

# Start Frontend
echo "Starting Frontend..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo "All services started!"
echo "Backend PID: $BACKEND_PID"
echo "AI Service PID: $AI_SERVICE_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo "AI Service: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "echo 'Stopping all services...'; kill $BACKEND_PID $AI_SERVICE_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait

