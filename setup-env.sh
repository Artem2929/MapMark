#!/bin/bash

echo "🔧 Setting up environment variables..."

if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
fi

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)
SEED_PASSWORD=$(openssl rand -base64 16)

# Update .env file
sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
sed -i.bak "s/SEED_PASSWORD=.*/SEED_PASSWORD=$SEED_PASSWORD/" .env

echo "✅ Environment variables configured:"
echo "   - JWT_SECRET: Generated secure random key"
echo "   - SEED_PASSWORD: Generated secure password"
echo ""
echo "⚠️  IMPORTANT: Review .env file and update other variables as needed"
echo "   - DB_URL: Update if using different database"
echo "   - VITE_API_URL: Update for production deployment"