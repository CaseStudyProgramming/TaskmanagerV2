# GitHub Mirror Setup for Forgejo

**Version**: 1.0
**Date**: 2026-11-07
**Status**: Active

---

## Overview

This document explains how to configure GitHub repository mirroring to Forgejo. This allows developers to continue using GitHub as the "source of truth" while Forgejo provides CI/CD pipeline execution.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              GITHUB → FORGEJO MIRRORING                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. DEVELOPER PUSH                                          │
│     └── git push to GitHub                                  │
│                                                               │
│  2. GITHUB WEBHOOK                                          │
│     └── Triggers Forgejo mirror sync                         │
│                                                               │
│  3. FORGEJO MIRROR SYNC                                     │
│     └── Pulls changes from GitHub                            │
│                                                               │
│  4. FORGEJO ACTIONS TRIGGER                                  │
│     └── Runs CI/CD workflows                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Why GitHub Mirror?

**Benefits:**
- ✅ GitHub remains as source of truth
- ✅ Developers continue using familiar GitHub workflow
- ✅ Forgejo provides self-hosted CI/CD
- ✅ Automatic sync ensures Forgejo always has latest code
- ✅ No disruption to existing GitHub-based tools

## Setup Instructions

### Step 1: Create Repository in Forgejo

1. Login to Forgejo: https://ci.davidcps.my.id
2. Click "+" → "New Repository"
3. Fill in repository details:
   - **Repository name**: taskmanagerV2 (must match GitHub repo name)
   - **Description**: Mirror from GitHub
   - **Visibility**: Private (or Public as needed)
   - **Initialize repository**: ❌ Uncheck all options
4. Click "Create Repository"

### Step 2: Configure Mirror Settings

1. Go to repository → Settings → Repository Settings
2. Scroll to "Mirroring Settings" section
3. Click "Add Mirror"
4. Fill in mirror configuration:
   - **Repository URL**: `https://github.com/davidtan/taskmanagerV2.git`
   - **Direction**: Pull from remote (Pull from upstream)
   - **Sync interval**: Every 5 minutes (or desired interval)
   - **Mirror private repository**: ❌ No (unless GitHub repo is private)
5. Click "Add Mirror"

### Step 3: Configure GitHub Webhook (Optional but Recommended)

**Why webhook?**
- Triggers immediate sync on push (faster than polling)
- Ensures Forgejo always has latest code for CI/CD

**Setup:**
1. Go to GitHub repository → Settings → Webhooks
2. Click "Add webhook"
3. Configure webhook:
   - **Payload URL**: `https://ci.davidcps.my.id/api/v1/repos/davidtan/taskmanagerV2/hooks/git-mirror`
   - **Content type**: application/json
   - **Secret**: (optional, for security)
   - **Events**: 
     - ✅ Push events
     - ✅ Pull request events (optional)
   - **Active**: ✅
4. Click "Add webhook"

### Step 4: Verify Mirror Configuration

**Manual Sync Test:**
1. Go to Forgejo repository → Actions
2. Click "Sync Now" (or similar button)
3. Check sync status
4. Verify code from GitHub appears in Forgejo

**Webhook Test:**
1. Go to GitHub webhook settings
2. Click "Recent deliveries"
3. Check last delivery status
4. Verify webhook triggers Forgejo sync

## Troubleshooting

### Mirror Not Syncing

**Check:**
1. Mirror settings in Forgejo are correct
2. GitHub repository URL is accessible
3. Mirror direction is "Pull from remote"
4. Sync interval is set correctly

**Fix:**
- Trigger manual sync in Forgejo UI
- Check Forgejo logs for sync errors
- Verify GitHub webhook is active

### Webhook Not Triggering

**Check:**
1. Webhook URL is correct
2. Webhook is active in GitHub
3. Forgejo server is accessible
4. Firewall allows incoming webhooks

**Fix:**
- Test webhook in GitHub UI
- Check Forgejo logs for webhook errors
- Verify iptables rules allow HTTP/HTTPS

### Authentication Issues

**For Private Repositories:**
- Enable "Mirror private repository" in Forgejo
- Configure authentication token
- Store token in Forgejo repository secrets

## Multiple Repositories

For 8 projects, repeat this process for each repository:

**Workflow:**
1. Create repository in Forgejo
2. Configure mirror from GitHub
3. Setup GitHub webhook
4. Verify sync
5. Configure Forgejo Actions workflow

**Naming Convention:**
- Forgejo repository name = GitHub repository name
- Easier to manage and avoid confusion

## Automation

### Script to Create Multiple Mirrors

```bash
#!/bin/bash
# create-mirrors.sh

REPOS=(
  "taskmanagerV2"
  "project2"
  "project3"
  # ... add more repos
)

GITHUB_USERNAME="davidtan"
FORGEJO_INSTANCE="https://ci.davidcps.my.id"
FORGEJO_TOKEN="YOUR_FORGEJO_TOKEN"

for repo in "${REPOS[@]}"; do
  echo "Creating mirror for $repo"
  
  # Create repository in Forgejo
  curl -X POST "$FORGEJO_INSTANCE/api/v1/user/repos" \
    -H "Authorization: token $FORGEJO_TOKEN" \
    -d "name=$repo&description=Mirror from GitHub&private=false"
  
  # Configure mirror (via API if available, or use UI)
  echo "Configure mirror in Forgejo UI for $repo"
done
```

## Best Practices

1. **Consistent Naming**: Use same repository name in GitHub and Forgejo
2. **Webhook First**: Setup webhook for immediate sync (faster than polling)
3. **Sync Interval**: Use 5-10 minutes for polling (if webhook fails)
4. **Monitor Sync**: Check sync status regularly
5. **Documentation**: Document mirror configuration for each repository

## Security Considerations

**For Private Repositories:**
- Use Forgejo repository secrets for authentication tokens
- Enable HTTPS for mirror URLs
- Rotate tokens regularly
- Limit webhook access with secrets

**For Public Repositories:**
- No authentication needed
- Simpler setup
- Less security overhead

## Summary

GitHub mirror configuration enables:
- Seamless GitHub workflow
- Forgejo CI/CD integration
- Automatic code sync
- No disruption to existing tools

**Next Steps:**
- Setup Forgejo Actions Runner
- Configure CI/CD workflows
- Test end-to-end pipeline
