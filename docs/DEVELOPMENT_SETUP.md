# Development Setup Guide

This guide explains how to set up the development environment. You can use either Docker or Podman - both are supported.

## Prerequisites

### Option 1: Docker
```bash
# Install Docker
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Option 2: Podman
```bash
# Install Podman
# Ubuntu/Debian
sudo apt update
sudo apt install -y podman podman-compose

# Enable rootless mode
# Podman is rootless by default
```

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/CaseStudyProgramming/TaskmanagerV2.git
cd TaskmanagerV2
```

### 2. Setup Environment Variables
```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

**Important:** Never commit `.env` to Git.

### 3. Run Development Server

#### If Using Docker
```bash
# Start services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

#### If Using Podman
```bash
# Start services
podman-compose up --build

# Stop services
podman-compose down

# View logs
podman-compose logs -f
```

### 4. Access Application
- Backend: http://localhost:3000
- Database: localhost:5432

## Building Images

### If Using Docker
```bash
# Build image
docker build -t taskmanager-backend ./backend

# Run container
docker run -p 3000:3000 --env-file .env taskmanager-backend
```

### If Using Podman
```bash
# Build image
podman build -t taskmanager-backend ./backend

# Run container
podman run -p 3000:3000 --env-file .env taskmanager-backend
```

## Pushing to Container Registry

### If Using Docker
```bash
# Tag image
docker tag taskmanager-backend ghcr.io/casestudyprogramming/taskmanager-backend:latest

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u casestudyprogramming --password-stdin

# Push image
docker push ghcr.com/casestudyprogramming/taskmanager-backend:latest
```

### If Using Podman
```bash
# Tag image
podman tag taskmanager-backend ghcr.com/casestudyprogramming/taskmanager-backend:latest

# Login to GHCR
echo $GITHUB_TOKEN | podman login ghcr.io -u casestudyprogramming --password-stdin

# Push image
podman push ghcr.com/casestudyprogramming/taskmanager-backend:latest
```

## Testing

### If Using Docker
```bash
# Run tests
docker-compose exec backend npm test

# Run specific test
docker-compose exec backend npm test -- --grep "test-name"
```

### If Using Podman
```bash
# Run tests
podman-compose exec backend npm test

# Run specific test
podman-compose exec backend npm test -- --grep "test-name"
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Permission Denied (Docker)
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Container Not Starting
```bash
# Check logs
docker-compose logs  # or podman-compose logs

# Check if container is running
docker ps  # or podman ps
```

## Important Notes

### Both Docker and Podman Use:
- ✅ Same `docker-compose.yml` file
- ✅ Same `Dockerfile`
- ✅ Same `.env` file
- ✅ Same commands (except `docker` vs `podman` prefix)

### File Structure
```
taskmanagerV2/
├── .env                  # Your local env (di-ignore)
├── .env.example          # Template (di-commit)
├── docker-compose.yml    # Universal (works with Docker & Podman)
└── Dockerfile            # Universal (works with Docker & Podman)
```

### Which Should You Use?
- **Docker:** More common, more documentation available
- **Podman:** Rootless, more secure, compatible with Docker

**Both work identically for this project. Choose what you prefer.**

## CI/CD Compatibility

**Important:** Regardless of whether you use Docker or Podman for development, CI/CD will work:

- If you build with Docker → Image pushed to GHCR → CI/CD (Podman) can pull and run
- If you build with Podman → Image pushed to GHCR → CI/CD (Podman) can pull and run

**Docker and Podman use the same image format (OCI compliant).**

Example:
```bash
# Dev builds with Docker
docker build -t myapp .
docker push ghcr.com/user/myapp:latest

# CI/CD runs with Podman
podman pull ghcr.com/user/myapp:latest
podman run ghcr.com/user/myapp:latest
# Works perfectly!
```

## Need Help?

- Check [DOCKER_PODMAN_ENV_STRATEGY.md](./DOCKER_PODMAN_ENV_STRATEGY.md) for detailed strategy
- Check [CREDENTIALS_GUIDE.md](./CREDENTIALS_GUIDE.md) for env variables management
- Ask in team chat or create an issue
