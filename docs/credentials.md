# Development Credentials

⚠️ **WARNING: This file contains sensitive credentials. DO NOT commit to Git.**

This file is intentionally excluded from version control via `.gitignore`.
Keep this file secure and do not share it.

---

## Forgejo CI/CD

### Admin Account
- Instance: https://ci.davidcps.my.id
- Username: davidtan
- Password: <CHANGE_ME>
- Email: admin@davidcps.my.id

### Database (Neon PostgreSQL)
- Project: CI-FORGEJO-OCI
- Database: ci-forgejo-oci
- Host: ep-broad-king-azlvkfiu.c-3.ap-southeast-1.aws.neon.tech
- User: ci-forgejo-oci_owner
- Password: <CHANGE_ME>
- Connection String:
  ```
  postgresql://ci-forgejo-oci_owner:<PASSWORD>@ep-broad-king-azlvkfiu.c-3.ap-southeast-1.aws.neon.tech/ci-forgejo-oci?sslmode=require
  ```

### Forgejo Access Token
- Scope: repo (read/write)
- Token: <CHANGE_ME>
- Used for: API calls, webhook handler

---

## OCI (Oracle Cloud Infrastructure)

### SSH Key Location
- Path: `/home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key`
- Used for: SSH access to OCI instances

### OCI API Key
- Config: `~/.oci/config`
- Private Key: `~/.oci/oci_api_private_key.pem`
- Used for: OCI CLI, SDK, MCP server

### OCI Instance
- Public IP: <CHANGE_ME>
- SSH User: ubuntu
- SSH Command:
  ```bash
  ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip>
  ```

---

## Cloudflare

### DDNS Script
- Script: `/usr/local/bin/update-cloudflare-dns`
- Config: `/usr/local/bin/update-cloudflare-dns.conf`
- Zone ID: <CHANGE_ME>
- API Token: <CHANGE_ME>

### SSL/Let's Encrypt
- Cloudflare Credentials: `/etc/letsencrypt/cloudflare.ini`
- API Token: <CHANGE_ME>

---

## Neon PostgreSQL (Other Projects)

### Connection Strings
Format:
```
postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

---

## Vercel Webhook Handler

### Environment Variables
- `FORGEJO_TOKEN`: <CHANGE_ME>
- `WEBHOOK_SECRET`: <CHANGE_ME>

### Deployment URL
- Production: https://forgejo-webhook.vercel.app
- Webhook Endpoint: https://forgejo-webhook.vercel.app/webhook

---

## GitHub

### Personal Access Tokens
- For CI/CD: <CHANGE_ME>
- For mirror sync: <CHANGE_ME>

### Organization
- Name: CaseStudyProgramming
- Webhook secret: <CHANGE_ME>

---

## Notes

### Adding New Credentials
1. Add credentials to this file only
2. Never commit this file to Git
3. Reference this file in main documentation as needed
4. Use placeholders like `<CHANGE_ME>` for sensitive values

### Security Best Practices
- ✅ Keep this file in local development environment only
- ✅ Use strong, unique passwords
- ✅ Rotate credentials regularly
- ✅ Never share this file via email or chat
- ✅ Use environment variables in production instead of hardcoding
- ❌ Never commit this file to Git
- ❌ Never include this file in documentation shared publicly

### Placeholder Pattern
When writing documentation, use this pattern:
```yaml
# In main docs (public)
password: <CHANGE_ME_USE_STRONG_PASSWORD>

# In this file (private)
password: actual-password-here
```

---

## Backup & Recovery

### Backup Strategy
- Store encrypted backup of this file in secure location
- Use password manager to store credentials separately
- Document process for credential rotation

### Rotation Schedule
- Passwords: Every 90 days
- API Tokens: Every 60 days
- SSH Keys: Every 180 days
