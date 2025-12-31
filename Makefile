.PHONY: up down restart logs clean install

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# View specific service logs
logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f mongodb

# Clean up everything
clean:
	docker-compose down -v
	docker system prune -f

# Install dependencies locally (for development)
install:
	npm install
	cd backend && npm install

# Development mode (with file watching)
dev:
	docker-compose up

# Production build
build:
	docker-compose build --no-cache

# Health check
health:
	curl -f http://localhost:3002/health || exit 1
	curl -f http://localhost:5173 || exit 1