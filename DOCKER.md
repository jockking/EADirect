# EA Direct - Docker Deployment Guide

This guide explains how to deploy EA Direct using Docker containers.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/jockking/EADirect.git
cd EADirect
```

### 2. Configure Environment (Optional)

Copy the example environment file and customize if needed:

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` to change default passwords and configuration.

### 3. Start the Application

```bash
docker compose up -d
```

This will:
- Build the backend and frontend containers
- Pull the PostgreSQL image
- Create a network for the services
- Start all services in the background
- **Automatically initialize the database** on first run

The database initialization happens automatically via the backend entrypoint script, which:
- Waits for PostgreSQL to be ready
- Creates all database tables
- Creates default admin and user accounts
- Starts the API server

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Service Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ http://localhost
       │
┌──────▼──────────────┐
│  Frontend (Nginx)   │
│    Port 80          │
└──────┬──────────────┘
       │
       │ /api/* → backend:8000
       │
┌──────▼──────────────┐
│  Backend (FastAPI)  │
│    Port 8000        │
└──────┬──────────────┘
       │
       │ PostgreSQL protocol
       │
┌──────▼──────────────┐
│  PostgreSQL DB      │
│    Port 5432        │
└─────────────────────┘
```

## Docker Compose Services

### postgres
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Volume**: postgres_data (persistent storage)
- **Health Check**: pg_isready

### backend
- **Build**: ./backend/Dockerfile
- **Port**: 8000
- **Volume**: ./backend/uploads (for user profile images)
- **Depends On**: postgres
- **Health Check**: API docs endpoint

### frontend
- **Build**: ./frontend/Dockerfile (multi-stage with nginx)
- **Port**: 80
- **Depends On**: backend
- **Health Check**: Root endpoint

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild After Code Changes
```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

### Access Container Shell
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec postgres psql -U postgres -d enterprise_architecture
```

### Check Service Health
```bash
docker-compose ps
```

## Database Management

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres enterprise_architecture > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres enterprise_architecture
```

### Reset Database
```bash
# Stop services
docker-compose down

# Remove volume
docker volume rm eadirect_postgres_data

# Start and reinitialize
docker-compose up -d
docker-compose exec backend python init_db.py
```

## Production Deployment

### 1. Update Environment Variables

Edit `.env.docker` or `docker-compose.yml`:

```yaml
environment:
  - SECRET_KEY=your-secure-random-secret-key-here
  - POSTGRES_PASSWORD=strong-password-here
  - ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Use External PostgreSQL (Optional)

For production, consider using a managed PostgreSQL service:

```yaml
backend:
  environment:
    - DATABASE_HOST=your-db-host.com
    - DATABASE_PORT=5432
    - DATABASE_NAME=enterprise_architecture
    - DATABASE_USER=your-user
    - DATABASE_PASSWORD=your-password
```

Then remove the postgres service from docker-compose.yml.

### 3. Add SSL/TLS

For HTTPS, add a reverse proxy like Traefik or update nginx configuration with SSL certificates.

### 4. Resource Limits

Add resource constraints:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

### 5. Use Docker Secrets

For sensitive data in Swarm mode:

```yaml
secrets:
  db_password:
    external: true
backend:
  secrets:
    - db_password
```

## Monitoring

### Health Checks

All services include health checks:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:8000/docs
curl http://localhost/
```

### Resource Usage

```bash
docker stats
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check if ports are already in use
lsof -i :80
lsof -i :8000
lsof -i :5432
```

### Database Connection Errors

```bash
# Verify postgres is ready
docker-compose exec postgres pg_isready -U postgres

# Check backend can connect
docker-compose exec backend python -c "from database import engine; print(engine)"
```

### Frontend Can't Reach Backend

1. Check nginx configuration in `frontend/nginx.conf`
2. Verify backend is healthy: `docker-compose ps`
3. Check network: `docker network inspect eadirect_ea-network`

### Permission Issues with Uploads

```bash
# Fix upload directory permissions
docker-compose exec backend chown -R $(id -u):$(id -g) /app/uploads
```

## Development with Docker

### Hot Reload for Backend

Mount code as volume for development:

```yaml
backend:
  volumes:
    - ./backend:/app
    - /app/venv  # Don't override venv
  command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Development

For frontend development, it's better to run Vite dev server locally:

```bash
cd frontend
npm install
npm run dev
```

Configure to proxy to dockerized backend.

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Check for migrations (if any)
docker-compose exec backend python init_db.py
```

## Cleanup

### Remove Old Images

```bash
docker image prune -a
```

### Remove Unused Volumes

```bash
docker volume prune
```

### Complete Cleanup

```bash
docker-compose down -v --rmi all
docker system prune -a
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/jockking/EADirect/issues
- Check logs: `docker-compose logs -f`

## Security Notes

1. **Change default passwords** before production deployment
2. **Use secrets management** for sensitive data
3. **Enable SSL/TLS** for production
4. **Regularly update** base images: `docker-compose pull`
5. **Scan for vulnerabilities**: `docker scan ea-direct-backend`
6. **Limit container permissions**: Run as non-root user where possible
7. **Network isolation**: Use separate networks for different layers

## Performance Tuning

### PostgreSQL

```yaml
postgres:
  command:
    - postgres
    - -c
    - max_connections=200
    - -c
    - shared_buffers=256MB
```

### Backend Workers

Use Gunicorn for production:

```dockerfile
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

### Nginx Caching

Add caching in nginx.conf for static assets (already configured).

## License

See LICENSE file in the repository.
