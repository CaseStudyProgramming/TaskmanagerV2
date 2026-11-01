# Scripts Directory

This directory contains scripts for the Advanced Task Manager project.

## Required Scripts

These scripts are used in the Woodpecker CI/CD pipeline and should be committed to Git:

- **deploy.sh** - Manual deployment script for staging and production
  - Used by Woodpecker pipeline for manual deployment
  - Commits: YES (required for CI/CD)

- **upload_artifacts.py** - Upload artifacts to OCI Object Storage with .zip compression
  - Used by Woodpecker pipeline to upload coverage, E2E, security reports
  - Compresses entire folder into 1 .zip file before upload
  - Commits: YES (required for CI/CD)

## Optional Scripts

These scripts are in the `optional/` folder and are only needed if you want granular control over artifact management. They are NOT required if using OCI Lifecycle Policy for auto-cleanup.

### optional/cleanup_artifacts.sh
- Tiered artifact cleanup script
- Different retention periods per artifact type
- Only needed if NOT using OCI Lifecycle Policy
- Commits: NO (optional, use only if needed)

### optional/monitor_storage.sh
- Storage usage monitoring script
- Shows usage by artifact type
- Alerts if usage > 80%
- Commits: NO (optional, use only if needed)

## Recommendation

**Use OCI Lifecycle Policy for auto-cleanup** (recommended):
- No scripts needed
- Auto-cleanup after retention period
- Maintenance-free
- See [Woodpecker Artifact Management](../docs/tdd/ci-cd/woodpecker-artifacts.md)

**Use optional scripts only if**:
- You need tiered retention (different retention per artifact type)
- You want granular control over cleanup
- You want detailed storage monitoring

## Git Strategy

### Required Scripts (commit to Git)
```bash
# These are in the root scripts/ folder
scripts/deploy.sh
scripts/upload_artifacts.py
```

### Optional Scripts (DO NOT commit to Git by default)
```bash
# These are in the scripts/optional/ folder
scripts/optional/cleanup_artifacts.sh
scripts/optional/monitor_storage.sh
```

**Why optional scripts should not be committed**:
- They are not required for CI/CD
- OCI Lifecycle Policy is the recommended approach
- Keeps repository clean
- Avoids confusion about which approach to use

**If you want to use optional scripts**:
1. Copy them from this folder to your local environment
2. Customize for your needs
3. Add to your local git if you want to track changes
4. Or add to .gitignore to exclude from repository

## Usage

### Required Scripts (used in CI/CD)

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Upload artifacts (used in Woodpecker pipeline)
python3 scripts/upload_artifacts.py \
  --bucket woodpecker-artifacts \
  --source coverage/ \
  --destination coverage/${CI_COMMIT_SHA}/ \
  --compress
```

### Optional Scripts (local use only)

```bash
# Cleanup old artifacts (if not using OCI Lifecycle Policy)
./scripts/optional/cleanup_artifacts.sh

# Monitor storage usage
./scripts/optional/monitor_storage.sh
```

## File Permissions

All scripts should be executable:

```bash
chmod +x scripts/deploy.sh
chmod +x scripts/upload_artifacts.py
chmod +x scripts/optional/cleanup_artifacts.sh
chmod +x scripts/optional/monitor_storage.sh
```
