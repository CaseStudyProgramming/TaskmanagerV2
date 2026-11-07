# Agent Guide for This Project

## OCI (Oracle Cloud Infrastructure) Operations

### Important: Compartment ID Not Auto-Loaded

The OCI MCP server (`oracle-oci-cloud-mcp-server`) is a **thin wrapper** over the OCI Python SDK. It uses the OCI config file (`~/.oci/config`) for **authentication only**, but does **NOT** automatically load the compartment_id for API calls.

**Config location:** `/home/davidtan/.oci/config`

### Getting Compartment ID

**Option 1: Use the helper script**
```bash
python3 .devin/oci_helpers.py
```

This reads the OCI config and returns the tenancy ID (which is the root compartment).

**Option 2: Read config directly**
The OCI config file contains:
- `tenancy` = root compartment ID
- `region` = OCI region
- Other auth credentials

### List VMs/Instances

When calling OCI APIs that require `compartment_id`, you must provide it explicitly:

**Example using MCP server:**
```python
# First get compartment ID from config
compartment_id = "ocid1.tenancy.oc1..aaaaaaaazyrx7bpogfwigffvcp4oxmgbecpxqtzc76h55oz2kunkidwl4xjq"

# Then call the API
mcp_call_tool(
    server_name="oracle-oci-cloud-mcp-server",
    tool_name="invoke_oci_api",
    arguments={
        "client_fqn": "oci.core.ComputeClient",
        "operation": "list_instances",
        "params": {"compartment_id": compartment_id}
    }
)
```

### Common OCI Operations

| Operation | Client | Example |
|-----------|--------|---------|
| List instances | `oci.core.ComputeClient` | `list_instances(compartment_id)` |
| Get instance details | `oci.core.ComputeClient` | `get_instance(instance_id)` |
| List compartments | `oci.identity.IdentityClient` | `list_compartments(compartment_id)` |
| List VCNs | `oci.core.VirtualNetworkClient` | `list_vcns(compartment_id)` |

### Why This Behavior?

This is by design in the OCI SDK:
- Config = authentication credentials only
- Compartment ID = explicit parameter for each API call
- Allows users to list resources in specific compartments, not just root
- Provides flexibility for multi-compartment workflows

### Available OCI MCP Tools

- `list_oci_clients` - List available SDK clients
- `find_oci_api` - Search for operations by keyword
- `describe_oci_operation` - Get operation details and parameters
- `invoke_oci_api` - Call an OCI SDK method
- `list_client_operations` - List operations for a specific client

### SSH Access to OCI Instances

**Important: OCI API Key ≠ SSH Key**

There are two different types of keys for OCI:

1. **OCI API Key** (`~/.oci/oci_api_private_key.pem`)
   - Used for OCI API authentication (OCI CLI, SDK, MCP server)
   - NOT used for SSH access to instances
   - Referenced in `~/.oci/config`

2. **SSH Key** (downloaded during instance creation)
   - Used for SSH access to compute instances
   - Downloaded when creating an instance
   - Location: `/home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key`

**SSH to instance:**
```bash
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip>
```

**Check if podman is installed:**
```bash
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip> "which podman && podman --version"
```

### OCI Instance Firewall (iptables)

**Important: HTTP/HTTPS ports need iptables rules**

OCI instances use Oracle-provided iptables rules that block HTTP (port 80) and HTTPS (port 443) by default. After opening ports in OCI Security List/NSG, you must also add iptables rules on the instance.

**Add iptables rules for HTTP/HTTPS:**
```bash
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip> << 'EOF'
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
EOF
```

**Make iptables rules persistent (survive reboot):**
```bash
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip> "sudo netfilter-persistent save"
```

**Why this is needed:**
- OCI Security List controls VCN-level traffic
- NSG (Network Security Group) controls subnet-level traffic
- iptables controls OS-level traffic on the instance
- All three layers must allow the port for traffic to pass through

### Cloudflare SSL/TLS Mode for HTTP-Only Servers

**Important: Match SSL/TLS mode with server configuration**

If your server only listens on HTTP (port 80) without SSL certificate, you must set Cloudflare SSL/TLS mode to **Flexible**.

**SSL/TLS modes:**
- **Flexible**: Browser → Cloudflare (HTTPS), Cloudflare → Origin (HTTP)
  - Use when: Server has no SSL certificate
  - Cloudflare handles SSL termination
- **Full**: Browser → Cloudflare (HTTPS), Cloudflare → Origin (HTTPS)
  - Use when: Server has SSL certificate (self-signed or valid)
- **Full (strict)**: Browser → Cloudflare (HTTPS), Cloudflare → Origin (HTTPS with valid cert)
  - Use when: Server has valid SSL certificate matching domain
  - Will fail if server has no SSL or self-signed cert

**For HTTP-only servers (like current setup):**
- Set SSL/TLS mode to **Flexible**
- Otherwise Cloudflare will return error 521 (origin unreachable)

### DDNS (Dynamic DNS) with Cloudflare

**Important: For ephemeral IP addresses**

If your OCI instance has an ephemeral public IP (can change on stop/start), you need DDNS to automatically update DNS records when IP changes.

**Setup DDNS on OCI instance:**

1. **Install DDNS script** (already setup in `/usr/local/bin/update-cloudflare-dns`)
2. **Configure** `/usr/local/bin/update-cloudflare-dns.conf`:
   ```bash
   what_ip="external"
   dns_record="server.davidcps.my.id"
   zoneid="your-zone-id"
   cloudflare_zone_api_token="your-api-token"
   proxied="false"
   ttl=1
   ```
3. **Setup cron job** (already configured):
   ```bash
   */5 * * * * /usr/local/bin/update-cloudflare-dns > /dev/null 2>&1
   ```

**DNS Structure for Ephemeral IP:**
```
server.davidcps.my.id         A  (updated by DDNS)
ci.davidcps.my.id            CNAME  server.davidcps.my.id
apitaskmanagerv2.davidcps.my.id  CNAME  server.davidcps.my.id
api-project2.davidcps.my.id      CNAME  server.davidcps.my.id
... (other projects)
```

**Benefits:**
- One A record (`server`) updated by DDNS
- All other subdomains use CNAME pointing to `server`
- If IP changes, only `server` A record needs update
- All CNAME records automatically follow new IP

### SSL Certificate with Let's Encrypt (Wildcard)

**Important: For Full (strict) SSL/TLS mode and end-to-end encryption**

Setup wildcard SSL certificate for all subdomains at once.

**Install certbot and Cloudflare DNS plugin:**
```bash
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip> << 'EOF'
sudo apt update
sudo apt install -y certbot python3-certbot-dns-cloudflare
EOF
```

**Configure Cloudflare credentials:**
```bash
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip> << 'EOF'
sudo mkdir -p /etc/letsencrypt
sudo tee /etc/letsencrypt/cloudflare.ini > /dev/null << 'CLOUDFLARE'
dns_cloudflare_api_token = your-cloudflare-api-token
CLOUDFLARE
sudo chmod 600 /etc/letsencrypt/cloudflare.ini
EOF
```

**Generate wildcard certificate:**
```bash
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip> << 'EOF'
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d '*.davidcps.my.id' -d 'davidcps.my.id' \
  --email 'your-email@example.com' \
  --agree-tos --no-eff-email
EOF
```

**Fix permissions for nginx container:**
```bash
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip} << 'EOF'
sudo chmod -R 755 /etc/letsencrypt
EOF
```

**Certificate location:**
- Full chain: `/etc/letsencrypt/live/davidcps.my.id/fullchain.pem`
- Private key: `/etc/letsencrypt/live/davidcps.my.id/privkey.pem`
- Auto-renewal: Configured by certbot (systemd timer)

**Benefits of wildcard certificate:**
- Single certificate for all subdomains
- No need to generate separate certificate for each domain
- Auto-renewal without needing to disable Cloudflare proxy
- Perfect for multi-service setup (Woodpecker + 8 backend projects)

### Forgejo CI/CD Setup

**Important: Production CI/CD server for 8 backend projects**

**Architecture:**
- **Source of Truth**: GitHub (personal account)
- **CI/CD Platform**: Forgejo (self-hosted)
- **Integration**: GitHub Mirror → Forgejo
- **Pipeline**: Forgejo Actions (GitHub Actions compatible)

**Forgejo containers:**
- `forgejo`: UI, API, and Git server (ports 3000 HTTP, 2222 SSH)
- `forgejo-proxy`: Nginx for SSL termination (ports 80, 443)

**Forgejo environment variables (docker-compose.yml):**
```bash
# Database Configuration
FORGEJO__database__DB_TYPE=postgres
FORGEJO__database__HOST=ep-broad-king-azlvkfiu.c-3.ap-southeast-1.aws.neon.tech
FORGEJO__database__NAME=ci-forgejo-oci
FORGEJO__database__USER=ci-forgejo-oci_owner
FORGEJO__database__PASSWD=npg_g6D4amnjezEJ
FORGEJO__database__SSL_MODE=require

# Server Configuration
FORGEJO__server__DOMAIN=ci.davidcps.my.id
FORGEJO__server__ROOT_URL=https://ci.davidcps.my.id
FORGEJO__server__SSH_DOMAIN=ci.davidcps.my.id
FORGEJO__server__SSH_PORT=2222
FORGEJO__server__HTTP_PORT=3000

# Actions (CI/CD)
FORGEJO__actions__ENABLED=true
```

**Forgejo database:**
- Current: Neon PostgreSQL (`ci-forgejo-oci` project)
- Neon project: `CI-FORGEJO-OCI` (muddy-bread-34400791)
- Database stores: Users, repos, Actions logs, artifacts
- Schema: Created automatically by Forgejo
- Benefits: Auto-backup, point-in-time recovery, scalable

**Nginx reverse proxy configuration:**
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ci.davidcps.my.id;
    return 301 https://$host$request_uri;
}

# HTTPS - Forgejo
server {
    listen 443 ssl;
    server_name ci.davidcps.my.id;

    ssl_certificate /etc/letsencrypt/live/davidcps.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/davidcps.my.id/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://forgejo:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Podman networking:**
- Shared network: `forgejo-net`
- All containers (forgejo, forgejo-proxy) on same network
- Nginx uses container name to resolve: `proxy_pass http://forgejo:3000`

**Setup commands:**
```bash
# Create network
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip> << 'EOF'
podman network create forgejo-net
EOF

# Start containers
ssh -i /home/davidtan/_Workspaces/_Catatan_WSL/SSH-KEY/ssh-key-2026-10-21.key ubuntu@<public-ip} << 'EOF'
cd /home/ubuntu/apps/forgejo
podman-compose up -d
cd /home/ubuntu/apps/forgejo-proxy
podman-compose up -d
EOF
```

**Access Forgejo:**
- URL: https://ci.davidcps.my.id
- Login with admin account (created during setup)
- Setup GitHub mirror for each repository

**GitHub Mirror Configuration:**
1. Create repository in Forgejo
2. Repository Settings → Mirroring Settings
3. Add mirror from GitHub: `https://github.com/davidtan/taskmanagerV2`
4. Configure sync interval (every 5 minutes)
5. GitHub webhook triggers mirror sync on push

**Future setup for 8 projects:**
- Create repository in Forgejo for each project
- Setup GitHub mirror for each repository
- Configure `.forgejo/workflows/*.yml` for CI/CD pipelines
- Setup Forgejo Actions Runner in OCI instance
- Setup secrets for deployment
- Configure nightly E2E tests via cron
