#!/bin/sh
# Docker entrypoint script for EA Direct backend

set -e

echo "============================================================"
echo "EA Direct Backend - Starting up"
echo "============================================================"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until python -c "import psycopg2; psycopg2.connect(host='${DATABASE_HOST}', port=${DATABASE_PORT}, user='${DATABASE_USER}', password='${DATABASE_PASSWORD}', dbname='postgres')" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"
echo ""

# Run database initialization
echo "Initializing database..."
python init_db.py

echo ""
echo "============================================================"
echo "Starting EA Direct API Server"
echo "============================================================"
echo ""

# Start the main application
exec python main.py
