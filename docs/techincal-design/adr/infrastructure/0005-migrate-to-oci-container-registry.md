# ADR 0005: Migrate to OCI Container Registry

**Status**: Accepted

**Context**: Originally used GitHub Container Registry (GHCR) for Docker image storage. As we are deploying to OCI Instance, it makes sense to use OCI Container Registry for better integration with the OCI ecosystem and artifact management.

**Decision**: Migrate from GitHub Container Registry (GHCR) to OCI Container Registry with artifact retention policies (1-day for artifacts, 3 last releases for images).

**Consequences**: Better integration with OCI ecosystem, but requires OCI credentials and different registry URL format.

---

## Context

### Background
- ADR 0002 (Technology Stack Selection) chose GitHub Container Registry (GHCR)
- Reason: Integrated with GitHub, no signup needed
- GHCR works well but is external to OCI ecosystem
- Production deployment is on OCI Instance
- OCI Registry provides better OCI ecosystem integration

### Problem Statement
- GHCR is external to OCI ecosystem
- No artifact retention policies in GHCR (manual cleanup required)
- OCI Registry provides better integration with OCI Instance
- Need artifact lifecycle management (cleanup old images)
- Want to optimize storage costs

### Requirements
- Container registry for Docker images
- Artifact retention policies (automatic cleanup)
- Integration with OCI ecosystem
- Support for CI/CD pipeline (Forgejo Actions)
- Cost-effective storage

## Decision

### Change Description
Migrate from GitHub Container Registry (GHCR) to OCI Container Registry with artifact retention policies.

### Implementation Details

**Registry Configuration:**
- **Registry**: OCI Container Registry (OCIR)
- **Registry URL**: `ocir.io/tenancy-namespace/repo-name`
- **Authentication**: OCI API key or auth token
- **Access**: Public or private (depending on configuration)

**Artifact Retention Policies:**
- **Artifacts**: 1-day retention (automatic cleanup)
- **Images**: Keep only 3 last releases (manual or automated cleanup)
- **Purpose**: Optimize storage cost and maintain clean registry

**Image Naming Convention:**
- **Format**: `ocir.io/tenancy-namespace/taskmanager-backend:tag`
- **Tags**: `latest`, `main-<sha>`, `v1.0.0`, etc.
- **Example**: `ocir.io/tenancy-namespace/taskmanager-backend:main-abc123def`

**CI/CD Configuration:**
```yaml
env:
  REGISTRY: ocir.io
  IMAGE_NAME_BACKEND: tenancy-namespace/taskmanager-backend

steps:
  - name: Log in to OCI Registry
    uses: docker/login-action@v3
    with:
      registry: ${{ env.REGISTRY }}
      username: ${{ secrets.OCI_USERNAME }}
      password: ${{ secrets.OCI_AUTH_TOKEN }}

  - name: Build and push
    uses: docker/build-push-action@v5
    with:
      context: ./backend
      push: true
      tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME_BACKEND }}:${{ github.sha }}
```

**Pull from OCI Registry:**
```bash
# Login to OCI Registry
podman login ocir.io -u tenancy-namespace -p <auth-token>

# Pull image
podman pull ocir.io/tenancy-namespace/taskmanager-backend:latest

# Run container
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env.production \
  ocir.io/tenancy-namespace/taskmanager-backend:latest
```

### Configuration Steps

1. **Create OCI Registry Repository**:
   - Go to OCI Console → Developer Services → Container Registry
   - Create repository: `taskmanager-backend`
   - Choose public or private access

2. **Get OCI Credentials**:
   - Generate API key or auth token in OCI Console
   - Store in CI/CD secrets: `OCI_USERNAME`, `OCI_AUTH_TOKEN`

3. **Update CI/CD Pipeline**:
   - Change registry URL from `ghcr.io` to `ocir.io`
   - Update image naming convention
   - Update authentication method (GitHub token → OCI auth token)

4. **Update Deployment Scripts**:
   - Update image pull commands
   - Update image references in docker-compose files
   - Update documentation

5. **Configure Artifact Retention**:
   - Set 1-day retention for build artifacts
   - Configure cleanup policy to keep 3 last releases
   - Test automatic cleanup

## Consequences

### Positive
- **OCI Ecosystem Integration**: Better integration with OCI Instance and other OCI services
- **Artifact Management**: Automatic cleanup with retention policies
- **Cost Optimization**: Reduced storage costs with automatic cleanup
- **Consistency**: All infrastructure components on OCI (compute, registry, database)
- **Regional Deployment**: OCI Registry supports regional deployment for lower latency
- **Access Control**: Better IAM integration with OCI

### Negative
- **Authentication Complexity**: Requires OCI credentials (API key or auth token)
- **Learning Curve**: Different registry URL format and authentication
- **Dependency on OCI**: Tied to OCI ecosystem (but this is aligned with infrastructure choice)
- **Migration Effort**: Requires updating CI/CD pipeline and deployment scripts
- **Documentation Updates**: All references to GHCR must be updated

### Neutral
- **Functionality**: Same functionality as GHCR (push, pull, tag)
- **Performance**: Similar performance for image push/pull
- **Support**: OCI Registry is well-documented and supported
- **Compatibility**: Compatible with Docker, Podman, and standard OCI tools

## Alternatives Considered

### Alternative 1: Stay with GitHub Container Registry (GHCR)
**Pros:**
- Integrated with GitHub
- No additional credentials required
- Familiar workflow

**Cons:**
- External to OCI ecosystem
- No built-in artifact retention policies
- Manual cleanup required
- Not optimized for OCI Instance deployment

**Rejected**: OCI Registry provides better integration and artifact management for OCI-based deployment.

### Alternative 2: Use Docker Hub
**Pros:**
- Popular and well-known
- Large public image repository

**Cons:**
- Rate limits on free tier
- No built-in retention policies
- External to OCI ecosystem
- Less control over infrastructure

**Rejected**: OCI Registry provides better integration and no rate limits for private registries.

### Alternative 3: Use Azure Container Registry (ACR) or AWS ECR
**Pros:**
- Mature container registries
- Good retention policies

**Cons:**
- Not aligned with OCI infrastructure
- Additional cloud provider dependency
- Higher cost for cross-region deployment

**Rejected**: OCI Registry is aligned with our infrastructure choice (OCI Instance) and cost-effective.

## Supersedes

This ADR supersedes the container registry decision in ADR 0002 (Technology Stack Selection).

- **ADR 0002 Status**: Partially superseded by ADR 0005
- **Reason**: Container registry changed from GHCR to OCI Registry
- **Impact**: Updated CI/CD pipeline, deployment scripts, and documentation

## References

- [ADR 0002: Technology Stack Selection](../global/0002-technology-stack-selection.md) - Original decision for GHCR
- [OCI Container Registry Documentation](https://docs.oracle.com/en-us/iaas/Content/Registry/Concepts/registryoverview.htm)
- [Infrastructure & Network Architecture](../../architecture/infrastructure-&-network.md) - Current registry configuration
- [Disaster Recovery](../../architecture/disaster-recovery.md) - Artifact retention details
