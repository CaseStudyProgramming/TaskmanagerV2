# Container Platform Strategy

## Overview

This document explains the container platform strategy for the Advanced Task Manager project, ensuring consistency across development, CI/CD, and production environments.

## Strategy Summary

| Environment | Platform | Reason |
|-------------|----------|--------|
| **Development (Windows/macOS)** | Docker Desktop | Best cross-platform support |
| **Development (Linux)** | Docker or Podman | Flexibility for team preference |
| **CI/CD (Forgejo Actions)** | Podman | Consistent with production (OCI) |
| **Production** | OCI Instance (Podman) | Self-managed container runtime |
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

### Forgejo Actions (Podman)

**Why Podman in CI/CD?**
- Consistent with production (OCI Instance uses Podman)
- Rootless and more secure
- No daemon required
- Better resource isolation
- Native OCI support

**Workflow:**
```yaml
# Podman operations in CI/CD:
# 1. Setup Podman (native on Forgejo runner)
# 2. Login to GHCR (GitHub token via Forgejo secrets)
# 3. Build and push image (Podman build)
# 4. Run tests in Podman containers
```

See `.forgejo/workflows/ci.yml` for complete implementation.

## Container Registry

### GitHub Container Registry (GHCR)

**Why GHCR?**
- **No additional signup** - Integrated with GitHub
- **Free** for public/private repositories
- **Automatic authentication** - Uses GitHub token (via Forgejo secrets)
- **Native Forgejo Actions support**
- **Single platform** for code and containers

**Image Naming Convention:**
```
ghcr.io/davidtan/taskmanager-backend:latest
ghcr.io/davidtan/taskmanager-backend:main-abc123def
ghcr.io/davidtan/taskmanager-backend:1.0.0
```

**Authentication:**
- CI/CD: Automatic via GitHub token (Forgejo secrets)
- Local: `docker login ghcr.io -u USERNAME -p TOKEN`
- Production (OCI): GitHub Personal Access Token (PAT) or OCI credentials

## Production Deployment

### OCI Instance Architecture

**Backend deployment on OCI Instance with Podman**

```
Frontend: Cloudflare Workers edge (SvelteKit adapter)
Backend:  OCI Instance (A1.Flex - 2 OCPUs, 12 GB RAM, Podman)
Database: Neon (PostgreSQL with branch-first workflow)
Cache:    Upstash (managed Redis)
```

### Deployment Process

```bash
# 1. Developer pushes code to GitHub
git push origin main

# 2. Forgejo CI/CD builds and pushes to GHCR
# - Docker builds image
# - Docker pushes to GHCR
# - Tests run in Docker containers

# 3. OCI Instance pulls latest image from GHCR
# - Podman handles container runtime
# - Nginx configured as reverse proxy
# - Manual deployment trigger

# 4. Cloudflare Workers deploys frontend from Git
# - Cloudflare builds and deploys to edge
# - Global CDN distribution
```

### OCI Instance Configuration

**Image Source:**
- Registry: GitHub Container Registry
- Image: `ghcr.io/davidtan/taskmanager-backend:latest`
- Authentication: GitHub username + PAT or OCI credentials
- Instance Type: A1.Flex - 2 OCPUs, 12 GB RAM
- Container Runtime: Podman
- Reverse Proxy: Nginx

**Manual deployment to OCI Instance:**
```bash
# SSH into OCI Instance
ssh user@oci-instance-ip

# Pull latest image
podman pull ghcr.io/davidtan/taskmanager-backend:latest

# Stop old container
podman stop taskmanager-backend
podman rm taskmanager-backend

# Start new container
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  ghcr.io/yourusername/taskmanager-backend:latest

# Configure Nginx reverse proxy
sudo systemctl reload nginx
```

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
   - Forgejo Actions uses Podman (consistent with production)
   - Local Docker/Podman choice doesn't matter for CI/CD

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
- Podman native support in Forgejo Actions
- Consistent with production (OCI Instance)
- Rootless and secure
- No daemon required

### Production Simplicity
- Podman installed on OCI Instance (A1.Flex - 2 OCPUs, 12 GB RAM)
- Self-managed container runtime
- Focus on application logic
- Manual scaling and management

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
# Forgejo secrets for GHCR
GITHUB_USERNAME: davidtan
GITHUB_TOKEN: your-github-token
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
- [Forgejo Documentation](https://forgejo.org/docs/)
- [Oracle Cloud Infrastructure Documentation](https://docs.oracle.com/en-us/iaas/)

## Questions?

For questions about the container strategy:
1. Check this documentation
2. Review `docs/project/dependencies.md` for detailed version information
3. Check `.forgejo/workflows/ci.yml` for CI/CD implementation
4. Contact the team for platform-specific guidance