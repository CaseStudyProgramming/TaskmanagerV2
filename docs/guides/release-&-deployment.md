# Release & Deployment

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document describes the staging and production release checklists, rollback procedures, and deployment strategies for the Advanced Task Manager project.

---

## Deployment Strategy

### Environments

| Environment | Purpose | Branch | Deployment Trigger |
|-------------|---------|--------|-------------------|
| **Development** | Local development | `feature/*` | Manual (local) |
| **Testing** | CI/CD testing | `develop` | Automatic (PR to develop) |
| **Staging** | Pre-production testing | `main` | Manual (PR to main) |
| **Production** | Live production | `main` | Manual (after staging) |

### Deployment Targets

**Frontend:**
- **Platform**: Cloudflare Workers
- **Trigger**: Manual deployment from Git
- **Process**: Cloudflare builds and deploys to edge

**Backend:**
- **Platform**: OCI Instance (Podman)
- **Trigger**: Manual deployment
- **Process**: Pull image from GHCR, restart container

---

## Staging Release Checklist

### Pre-Release

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version numbers updated
- [ ] Migration scripts tested
- [ ] Security scan passed
- [ ] Performance benchmarks met

### Staging Deployment

1. **Merge to main:**
```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

2. **Tag release:**
```bash
git tag -a v1.0.0-rc.1 -m "Release candidate v1.0.0-rc.1"
git push origin v1.0.0-rc.1
```

3. **Deploy to staging:**
```bash
# SSH to staging server
ssh user@staging-server

# Pull latest code
cd /home/ubuntu/apps/taskmanager
git pull origin main

# Pull latest image
podman pull ocir.io/tenancy-namespace/taskmanager-backend:v1.0.0-rc.1

# Restart container
podman stop taskmanager-backend
podman rm taskmanager-backend
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env.staging \
  ocir.io/tenancy-namespace/taskmanager-backend:v1.0.0-rc.1
```

4. **Run database migrations:**
```bash
cd /home/ubuntu/apps/taskmanager
goose -dir migrations postgres "$STAGING_DATABASE_URL" up
```

5. **Verify deployment:**
```bash
# Health check
curl http://localhost:8080/health

# Smoke tests
curl http://localhost:8080/api/v1/tasks
```

### Post-Release Validation

- [ ] Health check passes
- [ ] Smoke tests pass
- [ ] Manual testing completed
- [ ] Performance verified
- [ ] Error logs reviewed
- [ ] Monitoring dashboards verified

---

## Production Release Checklist

### Pre-Release

- [ ] Staging release successful
- [ ] All staging tests passed
- [ ] Staging issues resolved
- [ ] Stakeholder approval obtained
- [ ] Release notes prepared
- [ ] Rollback plan documented
- [ ] Team notified of release

### Production Deployment

1. **Create production tag:**
```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

2. **Deploy to production:**
```bash
# SSH to production server
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip>

# Pull latest code
cd /home/ubuntu/apps/taskmanager
git pull origin main

# Pull latest image
podman pull ocir.io/tenancy-namespace/taskmanager-backend:v1.0.0

# Stop old container
podman stop taskmanager-backend
podman rm taskmanager-backend

# Start new container
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env.production \
  ocir.io/tenancy-namespace/taskmanager-backend:v1.0.0

# Reload Nginx
sudo systemctl reload nginx
```

3. **Run database migrations:**
```bash
cd /home/ubuntu/apps/taskmanager
goose -dir migrations postgres "$PRODUCTION_DATABASE_URL" up
```

4. **Verify deployment:**
```bash
# Health check
curl http://localhost:8080/health

# Smoke tests
curl http://localhost:8080/api/v1/tasks

# Check logs
podman logs taskmanager-backend
```

### Post-Release Validation

- [ ] Health check passes
- [ ] Smoke tests pass
- [ ] Manual testing completed
- [ ] Performance verified
- [ ] Error logs reviewed
- [ ] Monitoring dashboards verified
- [ ] User feedback monitored

---

## Rollback Procedures

### Database Rollback

**Scenario:** Migration failure or data corruption

**Steps:**
```bash
# 1. Identify failed migration
goose -dir migrations postgres "$DATABASE_URL" status

# 2. Rollback migration
goose -dir migrations postgres "$DATABASE_URL" down

# 3. Verify rollback
goose -dir migrations postgres "$DATABASE_URL" status

# 4. Investigate issue
# 5. Fix migration
# 6. Re-run migration
goose -dir migrations postgres "$DATABASE_URL" up
```

### Application Rollback

**Scenario:** Application deployment failure or critical bug

**Steps:**
```bash
# 1. Stop current container
podman stop taskmanager-backend
podman rm taskmanager-backend

# 2. Pull previous image
podman pull ocir.io/tenancy-namespace/taskmanager-backend:v0.9.0

# 3. Start previous container
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env.production \
  ocir.io/tenancy-namespace/taskmanager-backend:v0.9.0

# 4. Verify rollback
curl http://localhost:8080/health

# 5. Monitor logs
podman logs -f taskmanager-backend
```

### Database Rollback (Point-in-Time Recovery)

**Scenario:** Data corruption or accidental data deletion

**Steps:**
```bash
# 1. Log in to Neon Console
# 2. Navigate to database: taskmanager_db
# 3. Click "Restore" or "Time Travel"
# 4. Select timestamp to restore to
# 5. Choose restore target:
#    - Create new branch (recommended)
#    - Overwrite existing branch (dangerous)
# 6. Wait for restore to complete
# 7. Update application DATABASE_URL to new branch
# 8. Restart application
podman restart taskmanager-backend
```

---

## Deployment Monitoring

### Health Checks

**Backend Health Endpoint:**
```
GET /health
Response: 200 OK
{
  "status": "healthy",
  "database": "connected",
  "cache": "connected",
  "timestamp": 1726652400000
}
```

**Monitoring:**
- Health check every 30 seconds
- Alert on 3 consecutive failures
- Dashboard for health status

### Log Monitoring

**Application Logs:**
```bash
# View container logs
podman logs -f taskmanager-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Log Aggregation:**
- Centralized logging (future)
- Log retention: 30 days
- Alert on error spikes

### Performance Monitoring

**Metrics to Track:**
- API response time (p50, p95, p99)
- Database query time
- Cache hit rate
- Error rate
- Request rate

**Alerting:**
- API response time > 500ms (p95)
- Error rate > 5%
- Database query time > 200ms (p95)
- Cache hit rate < 70%

---

## Release Communication

### Pre-Release

**Team Notification:**
- Release date and time
- Release notes
- Expected downtime (if any)
- Rollback plan

### Post-Release

**Stakeholder Notification:**
- Release completion
- New features
- Bug fixes
- Known issues

### Incident Communication

**If rollback needed:**
- Incident notification
- Impact assessment
- Resolution timeline
- Post-incident report

---

## References

- [Infrastructure & Network](../architecture/infrastructure-&-network.md) - Infrastructure details
- [Disaster Recovery](../architecture/disaster-recovery.md) - Recovery procedures
- [Git Workflow](./git-workflow.md) - Branch strategy
