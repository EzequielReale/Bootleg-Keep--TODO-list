#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Notes App Setup..."

# 1. Start the database
echo "📦 Starting PostgreSQL database via Docker Compose..."
docker compose up -d

echo "⏳ Waiting for database to be ready..."
# Wait for postgres to be ready (simple sleep, could be improved with pg_isready if psql client is installed)
sleep 5

# 2. Set up Backend
echo "⚙️ Setting up backend..."
cd backend

if [ ! -f .env ]; then
  echo "📝 Creating backend .env file from .env.example..."
  cp .env.example .env
fi

echo "📦 Installing backend dependencies..."
npm install

echo "🚀 Starting backend in development mode..."
npm run start:dev &
BACKEND_PID=$!

# 3. Set up Frontend
echo "🎨 Setting up frontend..."
cd ../frontend

echo "📦 Installing frontend dependencies..."
npm install

echo "🚀 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ All services are starting up!"
echo "Backend is running on port 3000 (usually)"
echo "Frontend is running on port 5173 (usually)"
echo "Press Ctrl+C to stop both servers."

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
