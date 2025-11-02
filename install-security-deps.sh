#!/bin/bash

echo "🔒 Installing security dependencies..."

# Frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install dompurify react-hook-form @hookform/resolvers yup

# Backend dependencies
echo "📦 Installing backend dependencies..."
cd backend/server
npm install helmet joi express-mongo-sanitize xss-clean

echo "✅ Security dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your environment variables"
echo "2. Review SECURITY.md for security guidelines"
echo "3. Run 'npm run dev' to start development server"