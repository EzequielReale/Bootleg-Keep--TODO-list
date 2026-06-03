#!/bin/bash

# Exit on error (we handle process killing carefully)
set -e

echo "🛑 Stopping all Notes App services..."

# Function to kill processes on a port
kill_port_processes() {
  local port=$1
  local name=$2
  echo "🔌 Checking for $name on port $port..."
  
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids=$(lsof -t -i:"$port" 2>/dev/null) || true
    if [ -n "$pids" ]; then
      echo "Found process(es) on port $port. Stopping them..."
      for pid in $pids; do
        kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
      done
    else
      echo "No process running on port $port."
    fi
  elif command -v fuser >/dev/null 2>&1; then
    fuser -k "$port"/tcp >/dev/null 2>&1 || true
  else
    echo "⚠️ Warning: Neither 'lsof' nor 'fuser' is installed. Unable to target port $port specifically."
  fi
}

# 1. Stop Frontend (port 5173)
kill_port_processes 5173 "Frontend (Vite)"

# 2. Stop Backend (port 3000)
kill_port_processes 3000 "Backend (NestJS)"

# 3. Stop PostgreSQL Database via Docker Compose
echo "📦 Stopping PostgreSQL database via Docker Compose..."
if command -v docker-compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1; then
  docker compose down || docker-compose down || true
else
  echo "⚠️ Warning: 'docker compose' or 'docker-compose' not found. Cannot stop database container."
fi

echo "✅ All services stopped successfully!"
