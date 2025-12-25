# MapMark - Full Stack Application

## Quick Start (One Command)

```bash
# Start everything (Frontend + Backend + Database)
make dev
```

Or using Docker Compose directly:
```bash
docker-compose up
```

## What gets started:
- **Frontend**: http://localhost:5173 (React + Vite)
- **Backend**: http://localhost:3001 (Node.js + Express)
- **Database**: MongoDB on port 27017
- **Health Check**: http://localhost:3001/health

## Available Commands

```bash
# Start all services
make up

# Stop all services  
make down

# View logs
make logs

# View specific service logs
make logs-backend
make logs-frontend
make logs-db

# Restart services
make restart

# Clean everything
make clean

# Health check
make health
```

## Development Features

✅ **Auto-reload**: All services restart automatically on file changes
✅ **Hot reload**: Frontend updates instantly
✅ **Database persistence**: Data survives container restarts
✅ **Logging**: Structured logs for all services
✅ **Health monitoring**: Built-in health checks

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│   Backend   │───▶│  MongoDB    │
│   React     │    │   Node.js   │    │  Database   │
│   :5173     │    │   :3001     │    │   :27017    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## First Time Setup

1. Make sure Docker is installed
2. Clone the repository
3. Run: `make dev`
4. Open http://localhost:5173

That's it! Everything will be set up automatically.

## Troubleshooting

If something goes wrong:
```bash
make clean  # Clean everything
make dev    # Start fresh
```