#!/bin/bash

# Start backend server script
cd backend/server

# Check if server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Server already running on port 3000"
else
    echo "Starting backend server..."
    npm start &
    echo "Backend server started on port 3000"
fi