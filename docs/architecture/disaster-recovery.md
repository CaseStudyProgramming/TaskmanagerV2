# Disaster Recovery

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document defines the disaster recovery strategy, RTO/RPO targets, backup procedures, and failover steps for the Advanced Task Manager project.

---

## Recovery Objectives

### RTO/RPO Targets

| Component | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) | Strategy |
|-----------|------------------------------|-------------------------------|----------|
| **Database (Neon)** | 1 hour | 5 minutes | Point-in-time recovery |
| **Cache (Upstash)** | 15 minutes | 0 minutes | Replication (automatic) |
| **Media Storage (VM)** | 4 hours | 24 hours | Weekly backups to Object Storage |
| **Application (OCI)** | 2 hours | 0 minutes | Container images in GHCR |
| **Configuration** | 1 hour | 0 minutes | Version control + backups |
| **DNS (Cloudflare)** | 5 minutes | 0 minutes | DDNS + manual override |

**Definitions:**
- **RTO**: Maximum acceptable time to restore service after failure
- **RPO**: Maximum acceptable data loss measured in time

---

## Backup Strategy

### Database Backups (Neon PostgreSQL)

**Automated Backups:**
- **Frequency**: Daily (automatic by Neon)
- **Retention**: 7 days (standard), 30 days (extended, if needed)
- **Backup Type**: Full database backup
- **Storage**: Neon-managed storage (encrypted)

**Point-in-Time Recovery (PITR):**
- **Granularity**: Per-second recovery up to 7 days
- **Usage**: Restore to specific timestamp
- **Cost**: Included in Neon plan

**Branch-Based Isolation:**
- **Production Branch**: `main` (live data)
- **Testing Branch**: `testing` (isolated test data)
- **Development Branch**: `dev` (development data)
- **Benefit**: Testing does not affect production data

**Backup Verification:**
- Monthly restore test to testing branch
- Verify data integrity
- Test application functionality with restored data

### Cache Backups (Upstash Redis)

**Replication Strategy:**
- **Primary-Replica**: Automatic replication across regions
- **Data Durability**: AOF (Append Only File) persistence
- **RPO**: 0 minutes (replication)
- **RTO**: 15 minutes (automatic failover)

**Note:** Redis is primarily a cache, not persistent storage. Data can be rebuilt from database if cache is lost.

### Media Storage Backups (OCI VM Storage)

**Backup Configuration:**
- **Source**: 200GB attached storage on OCI instance
- **Destination**: OCI Object Storage (10GB Standard tier)
- **Frequency**: Weekly
- **Retention**: 4 weeks
- **Method**: `rsync` incremental backup

**Backup Script:**
```bash
#!/bin/bash
# /usr/local/bin/backup-media.sh

SOURCE="/home/ubuntu/media"
DESTINATION="oci://bucket-name/backups/media"
DATE=$(date +%Y-%m-%d)

# Create backup
oci os object bulk-upload \
  --bucket-name bucket-name \
  --prefix "backups/media/$DATE/" \
  --source-dir "$SOURCE"

# Clean old backups (older than 4 weeks)
oci os object bulk-delete \
  --bucket-name bucket-name \
  --prefix "backups/media/" \
  --older-than 28d
```

**Cron Job:**
```bash
0 2 * * 0 /usr/local/bin/backup-media.sh > /var/log/backup-media.log 2>&1
```

### Configuration Backups

**Nginx Configuration:**
- **Source**: `/etc/nginx/`
- **Destination**: OCI Object Storage
- **Frequency**: On change
- **Retention**: 30 days

**Environment Variables:**
- **Source**: `.env.production` (server only)
- **Destination**: OCI Object Storage (encrypted)
- **Frequency**: On change
- **Retention**: 30 days

**Git Version Control:**
- **Configuration files**: Stored in Git repository
- **Infrastructure as Code**: Dockerfile, docker-compose.yml
- **CI/CD Configuration**: Forgejo workflows

---

## Recovery Procedures

### Database Recovery

**Scenario 1: Point-in-Time Recovery**

**Use Case:** Recover from accidental data deletion or corruption within 7 days.

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
# 8. Verify data integrity
# 9. Update DNS if needed (if new branch becomes production)
```

**Verification:**
```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check task count
SELECT COUNT(*) FROM tasks;

-- Check recent tasks
SELECT * FROM tasks ORDER BY created_at DESC LIMIT 10;
```

**Scenario 2: Branch Switch**

**Use Case:** Production branch fails, switch to testing branch temporarily.

**Steps:**
```bash
# 1. Update application DATABASE_URL to testing branch
export DATABASE_URL="postgresql://user:password@ep-xxx.aws.neon.tech/taskmanager_db_testing"

# 2. Restart application
podman restart taskmanager-backend

# 3. Verify application health
curl http://localhost:8080/health

# 4. Monitor for issues
# 5. Once production branch is fixed, switch back
```

### Cache Recovery

**Scenario: Redis Failure**

**Use Case:** Redis cache unavailable or data lost.

**Steps:**
```bash
# 1. Check Redis status
redis-cli ping

# 2. If Redis is down, check Upstash dashboard
# 3. Upstash provides automatic failover
# 4. Application will continue working (cache miss, slower)
# 5. If Redis is permanently lost:
#    a. Create new Redis instance in Upstash
#    b. Update REDIS_URL in .env.production
#    c. Restart application
#    d. Cache will warm up over time
```

**Note:** Cache is not critical for data persistence. Application will function without cache (slower performance).

### Media Storage Recovery

**Scenario: VM Storage Failure**

**Use Case:** 200GB VM storage becomes corrupted or unavailable.

**Steps:**
```bash
# 1. Check VM storage status
df -h /home/ubuntu/media

# 2. If storage is corrupted, restore from backup
oci os object bulk-download \
  --bucket-name bucket-name \
  --prefix "backups/media/latest/" \
  --dest-dir "/home/ubuntu/media"

# 3. Verify restored files
ls -lh /home/ubuntu/media

# 4. Update file references in database if paths changed
#    (This should not be needed if backup structure is consistent)

# 5. Restart application
podman restart taskmanager-backend
```

### Application Recovery

**Scenario 1: Container Failure**

**Use Case:** Backend container crashes or becomes unresponsive.

**Steps:**
```bash
# 1. Check container status
podman ps -a

# 2. Check container logs
podman logs taskmanager-backend

# 3. Restart container
podman restart taskmanager-backend

# 4. If restart fails, try to recreate
podman stop taskmanager-backend
podman rm taskmanager-backend
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env.production \
  ghcr.io/davidtan/taskmanager-backend:latest

# 5. Verify health
curl http://localhost:8080/health
```

**Scenario 2: Image Corruption**

**Use Case:** Docker image is corrupted or not working.

**Steps:**
```bash
# 1. Pull latest image from GHCR
podman pull ghcr.io/davidtan/taskmanager-backend:latest

# 2. If latest is corrupted, pull previous tag
podman pull ghcr.io/davidtan/taskmanager-backend:main-abc123def

# 3. Rebuild from source (if needed)
cd /home/ubuntu/apps/taskmanager
git pull origin main
podman build -t taskmanager-backend ./backend

# 4. Recreate container with new image
podman stop taskmanager-backend
podman rm taskmanager-backend
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env.production \
  ghcr.io/davidtan/taskmanager-backend:latest
```

**Scenario 3: Complete Server Failure**

**Use Case:** OCI instance is unrecoverable (hardware failure, account issue).

**Steps:**
```bash
# 1. Create new OCI instance
#    - Same specification: A1.Flex 2 OCPU 12GB
#    - Same OS: Debian 26 LTS
#    - Same SSH key

# 2. Install dependencies
sudo apt update
sudo apt install -y podman podman-compose nginx

# 3. Clone repository
git clone https://github.com/davidtan/taskmanagerV2.git
cd taskmanagerV2

# 4. Restore .env.production from backup
oci os object get \
  --bucket-name bucket-name \
  --name "backups/config/.env.production" \
  --file .env.production

# 5. Restore Nginx configuration
oci os object get \
  --bucket-name bucket-name \
  --name "backups/config/nginx.conf" \
  --file /etc/nginx/nginx.conf

# 6. Pull image from GHCR
podman pull ghcr.io/davidtan/taskmanager-backend:latest

# 7. Start container
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env.production \
  ghcr.io/davidtan/taskmanager-backend:latest

# 8. Restore media storage from backup
oci os object bulk-download \
  --bucket-name bucket-name \
  --prefix "backups/media/latest/" \
  --dest-dir /home/ubuntu/media

# 9. Update DNS (if IP changed)
#    - Update DDNS configuration
#    - Or manually update A record in Cloudflare

# 10. Verify deployment
curl http://localhost:8080/health
```

### Configuration Recovery

**Scenario: Configuration Corruption**

**Use Case:** Nginx configuration or environment variables are corrupted.

**Steps:**
```bash
# 1. Restore Nginx configuration
oci os object get \
  --bucket-name bucket-name \
  --name "backups/config/nginx.conf" \
  --file /etc/nginx/nginx.conf

# 2. Test Nginx configuration
sudo nginx -t

# 3. Reload Nginx
sudo systemctl reload nginx

# 4. Restore .env.production
oci os object get \
  --bucket-name bucket-name \
  --name "backups/config/.env.production" \
  --file /home/ubuntu/apps/taskmanager/.env.production

# 5. Restart application
podman restart taskmanager-backend
```

---

## Failover Steps

### Database Failover

**Trigger:** Production database is unavailable or corrupted.

**Steps:**
```bash
# 1. Switch to testing branch
export DATABASE_URL="postgresql://user:password@ep-xxx.aws.neon.tech/taskmanager_db_testing"

# 2. Update application configuration
#    Edit .env.production or docker-compose.prod.yml

# 3. Restart application
podman restart taskmanager-backend

# 4. Verify application health
curl http://localhost:8080/health

# 5. Monitor for issues
#    - Check application logs
#    - Monitor error rates
#    - Verify user data access

# 6. Investigate production branch issue
#    - Check Neon status page
#    - Review database logs
#    - Contact Neon support if needed

# 7. Fix production branch
#    - Restore from backup if needed
#    - Or create new branch from testing

# 8. Switch back to production branch
export DATABASE_URL="postgresql://user:password@ep-xxx.aws.neon.tech/taskmanager_db"

# 9. Restart application
podman restart taskmanager-backend

# 10. Verify application health
curl http://localhost:8080/health
```

### Application Failover

**Trigger:** Backend application is unresponsive or unhealthy.

**Steps:**
```bash
# 1. Check health endpoint
curl http://localhost:8080/health

# 2. If unhealthy, check container status
podman ps -a

# 3. Check container logs
podman logs taskmanager-backend

# 4. If container is down, restart
podman restart taskmanager-backend

# 5. If restart fails, try to recreate
podman stop taskmanager-backend
podman rm taskmanager-backend
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env.production \
  ghcr.io/davidtan/taskmanager-backend:latest

# 6. If image is corrupted, pull previous tag
podman pull ghcr.io/davidtan/taskmanager-backend:main-abc123def
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env.production \
  ghcr.io/davidtan/taskmanager-backend:main-abc123def

# 7. If all images fail, rebuild from source
cd /home/ubuntu/apps/taskmanager
git pull origin main
podman build -t taskmanager-backend ./backend
podman run -d \
  --name taskmanager-backend \
  -p 8080:8080 \
  --restart unless-stopped \
  --env-file .env.production \
  taskmanager-backend:latest

# 8. Verify health
curl http://localhost:8080/health
```

### DNS Failover

**Trigger:** OCI instance IP changes (ephemeral IP) or server is down.

**Steps:**
```bash
# 1. DDNS should automatically update
#    Check: /usr/local/bin/update-cloudflare-dns

# 2. If DDNS fails, manually update A record
#    a. Log in to Cloudflare dashboard
#    b. Navigate to DNS for davidcps.my.id
#    c. Update A record for server.davidcps.my.id
#    d. Set new IP address

# 3. If server is down and new instance is created:
#    a. Update A record to new instance IP
#    b. Wait for DNS propagation (usually < 5 minutes)
#    c. Verify application is accessible
```

---

## Business Continuity Plan

### Communication Plan

**Internal Team:**
- Incident notification via team chat (Slack/Discord)
- Status updates every 30 minutes during incident
- Post-incident report within 24 hours

**External Users:**
- Status page (future): status.davidcps.my.id
- Social media updates (Twitter/X) for major outages
- Email notification for critical data loss

### Service Levels

**Priority Levels:**

| Priority | Definition | Response Time | Resolution Time |
|----------|-------------|---------------|-----------------|
| **P1 - Critical** | Complete service outage | 15 minutes | 2 hours |
| **P2 - High** | Degraded service, data loss risk | 30 minutes | 4 hours |
| **P3 - Medium** | Partial outage, no data loss | 1 hour | 8 hours |
| **P4 - Low** | Minor issues, no impact | 4 hours | 24 hours |

### Escalation Matrix

| Severity | Team Lead | CTO | External Support |
|----------|-----------|-----|------------------|
| **P1** | Immediate | Immediate | If needed |
| **P2** | Within 15 min | Within 30 min | If needed |
| **P3** | Within 1 hour | Within 4 hours | N/A |
| **P4** | Within 4 hours | N/A | N/A |

---

## Testing & Drills

### Backup Testing

**Monthly:**
- Restore database from backup to testing branch
- Verify data integrity
- Test application functionality

**Quarterly:**
- Full disaster recovery drill
- Simulate server failure
- Practice complete recovery procedure

**Annually:**
- Review and update disaster recovery plan
- Update RTO/RPO targets if needed
- Evaluate new technologies or strategies

### Documentation Review

**Monthly:**
- Verify all procedures are accurate
- Update contact information
- Check backup scripts are working

**Quarterly:**
- Review RTO/RPO targets
- Update technology stack changes
- Refine procedures based on lessons learned

---

## References

- [System Overview](./system-overview.md) - High-level system architecture
- [Infrastructure & Network](./infrastructure-&-network.md) - Infrastructure details
- [Security & Compliance](./security-&-compliance.md) - Security measures
- [Local Setup Guide](../guides/local-setup.md) - Development environment setup
