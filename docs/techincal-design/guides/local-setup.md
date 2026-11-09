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

## Building Images (Optional Local Testing)

**Note:** Dev does NOT need to build/push images for CI/CD. CI/CD (Forgejo) handles this automatically when you push code to GitHub.

### If You Want to Test Container Locally (Optional)

#### If Using Docker
```bash
# Build image locally (for testing only)
docker build -t taskmanager-backend ./backend

# Run container
docker run -p 3000:3000 --env-file .env taskmanager-backend
```

#### If Using Podman
```bash
# Build image locally (for testing only)
podman build -t taskmanager-backend ./backend

# Run container
podman run -p 3000:3000 --env-file .env taskmanager-backend
```

**Important:** This is only for local testing. For CI/CD, just push code to GitHub - Forgejo will build the image.

## Pushing Code to GitHub (Required for CI/CD)

**Dev Workflow:**
```bash
# Commit changes
git add .
git commit -m "Your commit message"

# Push to GitHub
git push origin your-branch

# Create PR on GitHub
# Forgejo will mirror and trigger CI/CD
```

**Forgejo CI/CD will:**
- Build image from your code
- Run tests
- Push to OCI Registry (if passes)
- Deploy to production (if passes)


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

- If you build with Docker → Image pushed to OCI Registry → CI/CD (Podman) can pull and run
- If you build with Podman → Image pushed to OCI Registry → CI/CD (Podman) can pull and run

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

- Check [Infrastructure & Network](../architecture/infrastructure-&-network.md) for detailed infrastructure strategy
- Check [Credentials Guide](../CREDENTIALS_GUIDE.md) for env variables management
- Ask in team chat or create an issue
