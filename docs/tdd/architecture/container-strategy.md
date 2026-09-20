# Container Platform Strategy

## Overview

This document explains the container platform strategy for the Advanced Task Manager project, ensuring consistency across development, CI/CD, and production environments.

## Strategy Summary

| Environment | Platform | Reason |
|-------------|----------|--------|
| **Development (Windows/macOS)** | Docker Desktop | Best cross-platform support |
| **Development (Linux)** | Docker or Podman | Flexibility for team preference |
| **CI/CD (GitHub Actions)** | Docker | Native support, pre-installed |
| **Production** | PaaS (No Docker/Podman) | Managed services handle runtime |
| **Registry** | GHCR | Integrated with GitHub, no signup needed |

## Development Setup

### Windows/macOS (Docker Desktop)

```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
docker-compose --version

# Start development environment
docker-compose up -d
```

### Linux (Docker - Recommended)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version

# Start development environment
docker-compose up -d
```

### Linux (Podman - Optional)

```bash
# Install Podman
sudo apt install podman podman-compose

# Optional: Docker compatibility alias
alias docker=podman
alias docker-compose=podman-compose

# Start development environment (same docker-compose.yml)
docker-compose up -d
```

**Important:** Both Docker and Podman use the same `Dockerfile` and `docker-compose.yml`. OCI standard ensures compatibility.

## CI/CD Pipeline

### GitHub Actions (Docker Only)

**Why Docker in CI/CD?**
- Native support in GitHub Actions (pre-installed)
- No setup required on runners
- Rich ecosystem of Docker actions
- Better caching and performance
- Industry standard

**Workflow:**
```yaml
# Docker operations in CI/CD:
# 1. Setup Docker Buildx (native action)
# 2. Login to GHCR (automatic GitHub token)
# 3. Build and push image (Docker build-push action)
# 4. Run tests in Docker containers
```

See `.github/workflows/ci.yml` for complete implementation.

## Container Registry

### GitHub Container Registry (GHCR)

**Why GHCR?**
- **No additional signup** - Integrated with GitHub
- **Free** for public/private repositories
- **Automatic authentication** - Uses GITHUB_TOKEN
- **Native GitHub Actions support**
- **Single platform** for code and containers

**Image Naming Convention:**
```
ghcr.io/yourusername/taskmanager-backend:latest
ghcr.io/yourusername/taskmanager-backend:main-abc123def
ghcr.io/yourusername/taskmanager-backend:1.0.0
```

**Authentication:**
- CI/CD: Automatic via `GITHUB_TOKEN`
- Local: `docker login ghcr.io -u USERNAME -p TOKEN`
- Production (Koyeb): GitHub Personal Access Token (PAT)

## Production Deployment

### PaaS Architecture

**No Docker/Podman on production servers**

```
Frontend: Vercel (managed deployment from Git)
Backend:  Koyeb (pulls from GHCR, manages container runtime)
Database: Supabase (managed PostgreSQL)
Cache:    Upstash (managed Redis)
```

### Deployment Process

```bash
# 1. Developer pushes code to GitHub
git push origin main

# 2. GitHub Actions builds and pushes to GHCR
# - Docker builds image
# - Docker pushes to GHCR
# - Tests run in Docker containers

# 3. Koyeb automatically pulls latest image from GHCR
# - Koyeb handles container runtime
# - Koyeb manages scaling and health checks

# 4. No Docker/Podman installation on production servers
```

### Koyeb Configuration

**Image Source:**
- Registry: GitHub Container Registry
- Image: `ghcr.io/yourusername/taskmanager-backend:latest`
- Authentication: GitHub username + PAT

**No manual Docker commands needed on production servers.**

## Team Guidelines

### For New Team Members

1. **Choose your platform:**
   - Windows/macOS: Install Docker Desktop
   - Linux: Install Docker (recommended) or Podman (optional)

2. **Use same files:**
   - `docker-compose.yml` - Works with both Docker and Podman
   - `backend/Dockerfile` - Standard OCI format

3. **Local development:**
   ```bash
   docker-compose up -d  # Works with Docker or Podman
   ```

4. **CI/CD consistency:**
   - GitHub Actions always uses Docker
   - No need to match local platform choice

### For Platform Choice

**Choose Docker if:**
- New to containers
- On Windows/macOS
- Want cross-platform consistency
- Prefer industry standard

**Choose Podman if:**
- On Linux
- Security conscious (rootless)
- Prefer daemonless architecture
- Team already uses Podman

**Both choices are valid** - CI/CD and production remain the same.

## Key Benefits

### Development Flexibility
- Team members can choose Docker or Podman
- Same configuration files work across platforms
- No forced tool standardization

### CI/CD Simplicity
- Docker native support in GitHub Actions
- No setup required on runners
- Rich ecosystem of actions
- Industry standard approach

### Production Simplicity
- No Docker/Podman installation on servers
- PaaS providers handle container runtime
- Focus on application logic
- Automatic scaling and management

### Registry Convenience
- GHCR integrated with GitHub
- No additional signup required
- Free for project needs
- Automatic authentication

## Troubleshooting

### Docker Issues

**Docker not running:**
```bash
# Start Docker daemon
sudo systemctl start docker
sudo systemctl enable docker
```

**Permission denied:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### Podman Issues

**Podman networking:**
```bash
# Use rootless networking
podman network create my-network
```

**Docker compatibility:**
```bash
# Enable Docker compatibility API
sudo systemctl enable --now podman.socket
sudo ln -s /usr/bin/podman /usr/bin/docker
```

### CI/CD Issues

**GHCR authentication:**
```yaml
# Ensure correct permissions
permissions:
  contents: read
  packages: write
```

**Build failures:**
```bash
# Check Docker Buildx setup
# Verify docker-compose.yml syntax
# Ensure Dockerfile is valid
```

## References

- [Docker Documentation](https://docs.docker.com/)
- [Podman Documentation](https://docs.podman.io/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Actions Docker](https://github.com/docker/build-push-action)
- [Koyeb Documentation](https://www.koyeb.com/docs)

## Questions?

For questions about the container strategy:
1. Check this documentation
2. Review `docs/project/dependencies.md` for detailed version information
3. Check `.github/workflows/ci.yml` for CI/CD implementation
4. Contact the team for platform-specific guidance