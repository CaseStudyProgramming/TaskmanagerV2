#!/bin/bash
# scripts/deploy.sh - Manual deployment script for Woodpecker CI/CD
# This script handles manual deployment to staging and production environments

set -e  # Exit on error

ENVIRONMENT=$1
PROJECT_NAME=${PROJECT_NAME:-taskmanager}

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: ./deploy.sh <staging|production>"
    exit 1
fi

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "Error: Environment must be 'staging' or 'production'"
    exit 1
fi

echo "=========================================="
echo "Deploying $PROJECT_NAME to $ENVIRONMENT"
echo "=========================================="

# Pull latest image from registry
echo "Pulling latest image from registry..."
podman pull ghcr.io/$GITHUB_USERNAME/$PROJECT_NAME-backend:latest

# Stop existing container
echo "Stopping existing container..."
podman stop $PROJECT_NAME-backend-$ENVIRONMENT || true
podman rm $PROJECT_NAME-backend-$ENVIRONMENT || true

# Start new container
echo "Starting new container..."
podman run -d \
  --name $PROJECT_NAME-backend-$ENVIRONMENT \
  --restart unless-stopped \
  -p 8080:8080 \
  -e DB_HOST=$DB_HOST \
  -e DB_PASSWORD=$DB_PASSWORD \
  -e REDIS_HOST=$REDIS_HOST \
  -e ENVIRONMENT=$ENVIRONMENT \
  ghcr.io/$GITHUB_USERNAME/$PROJECT_NAME-backend:latest

# Wait for container to be healthy
echo "Waiting for container to be healthy..."
sleep 10

# Run smoke tests
echo "Running smoke tests..."
bun run test:smoke

echo "=========================================="
echo "Deployment to $ENVIRONMENT completed successfully!"
echo "=========================================="
