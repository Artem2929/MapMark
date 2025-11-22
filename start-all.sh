#!/bin/bash

echo "🚀 Запуск MapMark - всі сервіси"
echo "================================"

# Перевірка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не встановлено. Встановіть Docker Desktop для macOS"
    exit 1
fi

# Перевірка чи запущений Docker
if ! docker info &> /dev/null; then
    echo "❌ Docker не запущений. Запустіть Docker Desktop"
    exit 1
fi

echo "✅ Docker готовий"

# Встановлення залежностей бекенда якщо потрібно
if [ ! -d "backend/server/node_modules" ]; then
    echo "📦 Встановлення залежностей бекенда..."
    cd backend/server && npm install && cd ../..
fi

echo "🗄️  Запуск MongoDB..."
cd backend && docker-compose up -d mongodb && cd ..

echo "⏳ Очікування запуску MongoDB (5 секунд)..."
sleep 5

echo "🖥️  Запуск всіх сервісів..."
npm run dev