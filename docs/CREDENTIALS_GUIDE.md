# Credentials Management Guide

This guide explains how to manage development credentials securely using environment variables without committing them to Git.

## Files Structure

```
taskmanagerV2/
├── .env                      # Actual credentials (NOT committed to Git)
├── .env.example              # Template file (committed to Git)
├── .gitignore                # Ignore .env files
├── .devin/
│   ├── mcp_config.json       # Project MCP config (uses env variables)
│   └── load-env.sh           # Script to load env variables
├── docs/
│   ├── credentials.md        # Manual reference (NOT committed to Git)
│   ├── credentials.md.example # Template (committed to Git)
│   └── CREDENTIALS_GUIDE.md  # This file
└── ~/.config/devin/
    └── mcp_config.json       # Global MCP config (uses env variables)
```

## Quick Start

### 1. Setup Environment Variables File

```bash
# Copy template to actual env file
cp .env.example .env

# Edit with actual values
nano .env
# or
code .env
```

### 2. Fill in Environment Variables

Replace all placeholder values with actual credentials:

```bash
# Forgejo
FORGEJO_ADMIN_PASSWORD=actual-password
FORGEJO_DATABASE_PASSWD=actual-db-password
FORGEJO_TOKEN=actual-token

# Neon Database
NEON_API_KEY=actual-api-key
DATABASE_URL=postgresql://user:password@host/db
```

### 3. Verify Git Ignore

The `.gitignore` file already includes:
```
# Environment variables
.env
.env.development
.env.production
```

Verify:
```bash
git check-ignore .env
# Should output: .env
```

### 4. Test if File is Ignored

```bash
# Check git status - .env should NOT appear
git status

# Check if file is tracked
git ls-files | grep .env
# Should return nothing
```

## Using Credentials in Documentation

### Pattern 1: Reference to Environment Variables

In main documentation (public):
```yaml
# docs/tdd/ci-cd/forgejo-ci.md
- FORGEJO__admin__password=${FORGEJO_ADMIN_PASSWORD}  # Set in .env file
```

In .env file (private):
```bash
FORGEJO_ADMIN_PASSWORD=actual-password-here
```

### Pattern 2: Placeholder with Comment

In main documentation:
```yaml
# Database password - set in .env file
FORGEJO__database__PASSWD=${FORGEJO_DATABASE_PASSWD}
```

## Security Best Practices

### DO ✅
- ✅ Keep `.env` in local development environment only
- ✅ Use strong, unique passwords
- ✅ Rotate credentials regularly
- ✅ Use password manager to store credentials
- ✅ Commit `.env.example` to Git
- ✅ Reference .env in documentation with comments
- ✅ Load env variables before running AI agent

### DON'T ❌
- ❌ Commit `.env` to Git
- ❌ Share .env via email or chat
- ❌ Include actual credentials in public documentation
- ❌ Store credentials in environment files that are committed
- ❌ Use the same password across multiple services
- ❌ Let AI agent read .env file directly

## Loading Environment Variables for AI Agent

### Why This Matters

AI agents (like Devin) need credentials to access MCP servers and perform actions. However, we want to avoid having the agent read the `.env` file directly (which could send credentials to the LLM).

### The Solution: Load Env to Shell

Instead of letting the agent read the `.env` file, load environment variables into the shell first:

```bash
# Load env variables to shell
export $(cat .env | xargs)

# Now run the agent
# Agent can access env variables from shell
# Agent does NOT read the .env file
```

### Loading Methods

**Option 1: Manual Export**
```bash
export $(cat .env | xargs)
devin start
```

**Option 2: Using dotenv**
```bash
npm install -g dotenv-cli
dotenv -e .env -- devin start
```

**Option 3: Using Wrapper Script (Optional)**
```bash
# .devin/load-env.sh
#!/bin/bash
export $(cat .env | xargs)
exec "$@"

# Usage
./.devin/load-env.sh devin start
```

### MCP Configuration

MCP config should use environment variables. There are two levels of MCP config:

#### 1. Global MCP Config (User Level)
**Location:** `~/.config/devin/mcp_config.json`
**Applies to:** All projects

Example (for OCI):
```json
{
  "mcpServers": {
    "oracle-oci-cloud-mcp-server": {
      "command": "/home/davidtan/.local/bin/uvx",
      "args": ["oracle.oci-cloud-mcp-server@latest"],
      "env": {
        "OCI_CONFIG_PROFILE": "${OCI_CONFIG_PROFILE:-DEFAULT}"
      }
    }
  }
}
```

#### 2. Project MCP Config (Project Level)
**Location:** `.devin/mcp_config.json`
**Applies to:** This project only

Example (for Neon and Aiven):
```json
{
  "mcpServers": {
    "neon": {
      "url": "https://mcp.neon.tech/mcp",
      "transport": "http",
      "env": {
        "NEON_API_KEY": "${NEON_API_KEY:-}"
      }
    },
    "aiven": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.aiven.live/mcp"],
      "env": {
        "AIVEN_API_KEY": "${AIVEN_API_KEY:-}"
      }
    }
  }
}
```

**Important:**
- MCP config uses `${VARIABLE:-default}` syntax
- Credentials are in .env file (not in MCP config)
- Agent loads env variables before starting
- Agent accesses MCP with env variables (not reading file)
- `${VARIABLE:-default}` uses default if env variable not set

## Team Collaboration

### For New Team Members

1. Clone repository
2. Copy template: `cp .env.example .env`
3. Ask project maintainer for actual credentials
4. Fill in .env with provided values
5. Verify file is ignored by Git
6. Load env variables before starting agent: `export $(cat .env | xargs)`

### Sharing Credentials Securely

**Use password manager instead of email:**
- 1Password, Bitwarden, LastPass, etc.
- Share credentials via password manager sharing feature
- Never send credentials via plain text email or chat

**Or share .env file securely:**
- Share via encrypted channel (GPG encrypted file)
- Use password manager to store credentials
- Team member fills their own .env file

## Credential Rotation

### Rotation Process

1. **Rotate credential in the service** (Forgejo, Neon, etc.)
2. **Update .env file** with new value
3. **Reload env variables**: `export $(cat .env | xargs)`
4. **Update production/services** if needed
5. **Notify team members** if shared

### Rotation Schedule

| Credential Type | Rotation Frequency |
|-----------------|-------------------|
| Passwords | Every 90 days |
| API Tokens | Every 60 days |
| SSH Keys | Every 180 days |
| Database Passwords | Every 90 days |

## Pre-commit Hook with Gitleaks

To prevent accidental credential commits, setup gitleaks:

### Install Gitleaks

```bash
# macOS
brew install gitleaks

# Linux
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

### Configure Gitleaks

```bash
cd /home/davidtan/_Workspaces/WebDevelopment/taskmanagerV2
gitleaks init
```

Edit `.gitleaks.toml` to customize rules.

### Pre-commit Hook

```bash
pip install pre-commit
```

Create `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

Install hooks:
```bash
pre-commit install
```

## Environment Variables in Production

For production deployments, use environment variables instead of credentials file:

### Vercel Example
```bash
# In Vercel dashboard
Settings → Environment Variables

# Add variables:
FORGEJO_TOKEN=actual-token
WEBHOOK_SECRET=actual-secret
```

### Docker Compose Example
```yaml
# docker-compose.yml
services:
  app:
    environment:
      - DATABASE_URL=${DATABASE_URL}  # From .env file
```

### OCI Instance Example
```bash
# In OCI instance
export DATABASE_URL="postgresql://..."
export FORGEJO_TOKEN="..."
```

## Backup & Recovery

### Backup .env File

```bash
# Encrypt backup
gpg -c .env

# Store encrypted file in secure location
mv .env.gpg ~/secure-backup/
```

### Restore .env File

```bash
# Decrypt backup
gpg -d ~/secure-backup/.env.gpg > .env
```

## Troubleshooting

### Issue: .env File is Tracked by Git

**Solution:**
```bash
# Remove from git tracking
git rm --cached .env

# Verify it's in .gitignore
echo ".env" >> .gitignore

# Commit changes
git add .gitignore
git commit -m "Add .env to gitignore"
```

### Issue: Agent Cannot Access Environment Variables

**Solution:**
```bash
# Make sure env variables are loaded
export $(cat .env | xargs)

# Verify variables are set
echo $FORGEJO_ADMIN_PASSWORD
echo $NEON_API_KEY

# Restart agent
```

### Issue: Accidentally Committed .env File

**Solution:**
1. **Immediately rotate compromised credentials**
2. **Remove from git history:**
   ```bash
   # Remove file from history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push to remote
   git push origin --force --all
   ```
3. **Notify team members about security incident**

### Issue: MCP Server Cannot Connect

**Solution:**
```bash
# Check if env variables are set
echo $NEON_API_KEY

# Check MCP config
cat ~/.config/devin/mcp/servers.json

# Make sure env variables are loaded before starting agent
export $(cat .env | xargs)
```

## Production Deployment

### Production Environment Variables

For production deployments, credentials should be set in the production environment (not in .env file):

**Option 1: Systemd Service**
```bash
# /etc/systemd/system/your-app.service
[Service]
Environment="FORGEJO_ADMIN_PASSWORD=prod-password"
Environment="FORGEJO_DATABASE_PASSWD=prod-db-password"
Environment="NEON_API_KEY=prod-api-key"
```

**Option 2: Production .env File**
```bash
# In production server
/home/ubuntu/apps/your-app/.env
# Loaded by docker-compose or application
```

**Option 3: Secret Management (Recommended)**
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Neon Database Secrets

### No Development Server

This project does not have a separate development server. Development happens locally with:
- Local database (test_db)
- Production MCP access via env variables
- Credentials in local .env file (not committed)

Production is deployed directly to:
- OCI instance
- Neon database
- Forgejo CI/CD

## Additional Resources

- [OWASP Credential Management](https://owasp.org/www-community/credentials_management)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [Pre-commit Documentation](https://pre-commit.com/)
- [Git Security Best Practices](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)
- [MCP Documentation](https://modelcontextprotocol.io/)

## Questions?

If you have questions about credentials management:
1. Check this guide first
2. Refer to `.env.example` for template
3. Refer to `docs/credentials.md.example` for detailed reference
4. Contact project maintainer for help
