# MapMark Backend

This backend provides a REST API for the MapMark application with MongoDB for geo-spatial data storage.

## Structure

```
backend/
├── mongodb/
│   ├── Dockerfile          # MongoDB 7.0 with geo support
│   └── init-mongo.js       # Database initialization with sample data
├── server/
│   ├── Dockerfile          # Node.js LTS server
│   ├── package.json        # Dependencies
│   └── server.js           # Express server with API endpoints
└── docker-compose.yml      # Orchestrates both services
```

## Features

- **MongoDB 7.0** with geo-spatial indexing (2dsphere)
- **Node.js LTS** with Express server
- **Sample data** with 5 location objects
- **Environment variables** for configuration
- **Health check** endpoint
- **CORS enabled** for frontend integration

## Prerequisites

- Docker Compose v2.22+ (required for `compose watch`)
- Docker Desktop or Docker Engine with BuildKit enabled

## Quick Start

### Production Mode
1. **Build and start services:**
   ```bash
   cd backend
   docker compose up --build
   ```

### Development Mode (Auto-rebuild on changes)
1. **Start with compose watch for automatic rebuilds:**
   ```bash
   cd backend
   docker compose watch
   ```
   
   This will:
   - Build and start both services
   - Watch for changes in the `./server` directory (rebuilds server)
   - Watch for changes in the `./mongodb` directory (rebuilds MongoDB)
   - Automatically rebuild and restart containers when files change
   - Ignore `node_modules/` and `.git/` directories

### Manual Rebuild Options
1. **Rebuild only the server:**
   ```bash
   cd backend
   ./rebuild-server.sh
   ```

2. **Or rebuild manually:**
   ```bash
   cd backend
   docker-compose build server
   docker-compose up -d
   ```

### Test the API
```bash
# Health check
curl http://localhost:3000/api/health

# Get all locations
curl http://localhost:3000/api/locations
```

## API Endpoints

### GET /
- **Description:** Server info and available endpoints
- **Response:** Server status and API documentation

### GET /api/health
- **Description:** Health check endpoint
- **Response:** Server status, uptime, and database connection status

### GET /api/locations
- **Description:** Get all location data
- **Response:** Array of location objects with the following structure:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "id": "ObjectId",
        "lat": 40.7128,
        "lng": -74.0060,
        "image": "https://example.com/images/nyc.jpg",
        "review": "Amazing view of the city skyline!",
        "rating": 5,
        "author": "John Doe",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

## Environment Variables

- `NODE_ENV`: Environment (production/development)
- `PORT`: Server port (default: 3000)
- `DB_URL`: MongoDB connection string

## Sample Data

The database is initialized with 5 sample locations:
- New York City (40.7128, -74.0060)
- London (51.5074, -0.1278)
- Paris (48.8566, 2.3522)
- Tokyo (35.6762, 139.6503)
- Sydney (-33.8688, 151.2093)

Each location includes:
- Base64 encoded sample images (1x1 pixel for demo)
- Realistic reviews and ratings
- Author information
- Proper geo-spatial coordinates

## Stopping Services

```bash
docker-compose down
```

To also remove volumes (this will delete all data):
```bash
docker-compose down -v
```
