#!/bin/bash

echo "Restarting MapMark backend server..."

# Kill existing node processes
pkill -f "node.*server.js" || true
pkill -f "npm.*start" || true

# Wait a moment
sleep 2

# Navigate to backend directory
cd /Users/artempolishchuk/Desktop/MapMark/backend/server

# Start the server
echo "Starting server..."
npm start &

echo "Backend server restarted!"
echo "Check logs at: http://localhost:3001/api/health"