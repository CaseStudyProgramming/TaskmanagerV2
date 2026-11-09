# ADR 0004: Upgrade to Cloudflare Full Strict SSL/TLS Mode

**Status**: Accepted

**Context**: Previously used Cloudflare Flexible SSL/TLS mode because the OCI instance did not have an SSL certificate. After installing Let's Encrypt wildcard certificate, we can now upgrade to Full Strict mode for end-to-end encryption.

**Decision**: Upgrade Cloudflare SSL/TLS mode from Flexible to Full (strict) with Let's Encrypt wildcard certificate on OCI instance.

**Consequences**: End-to-end encryption with improved security, but requires SSL certificate management and renewal.

---

## Context

### Background
- ADR 0002 (Technology Stack Selection) chose Cloudflare Flexible SSL/TLS mode
- Reason: OCI instance had no SSL certificate at that time
- Flexible mode: Browser → Cloudflare (HTTPS), Cloudflare → Origin (HTTP)
- Trade-off: Origin traffic unencrypted (trusted via Cloudflare only)

### Problem Statement
- Flexible mode provides partial encryption (browser → Cloudflare only)
- Origin traffic (Cloudflare → OCI instance) is unencrypted
- Full Strict mode is preferred for production security
- SSL certificate now available (Let's Encrypt wildcard installed)

### Requirements
- End-to-end encryption for production deployment
- Valid SSL certificate matching domain
- Automatic certificate renewal
- No service disruption during migration

## Decision

### Change Description
Upgrade Cloudflare SSL/TLS mode from **Flexible** to **Full (strict)** with Let's Encrypt wildcard certificate.

### Implementation Details

**SSL Certificate:**
- **Provider**: Let's Encrypt (certbot + Cloudflare DNS plugin)
- **Type**: ECDSA wildcard certificate
- **Domains**: `*.davidcps.my.id` and `davidcps.my.id`
- **Location**: `/etc/letsencrypt/live/davidcps.my.id/`
- **Validity**: Valid until 2027-02-04 (auto-renewal via certbot systemd timer)

**Nginx Configuration:**
- **SSL Port**: 443 (HTTPS)
- **HTTP Port**: 80 (redirect to HTTPS)
- **SSL Termination**: Nginx container on OCI instance
- **Backend**: HTTP 8080 (internal, not exposed to internet)

**Network Flow:**
```
Browser → HTTPS (443) → Cloudflare (Full Strict) → HTTPS (443) → Nginx → HTTP (8080) → Backend
```

### Configuration Steps

1. **Install SSL Certificate** (Already completed):
   ```bash
   ssh ubuntu@<oci-instance>
   sudo apt install certbot python3-certbot-dns-cloudflare
   sudo certbot certonly --dns-cloudflare \
     --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
     -d '*.davidcps.my.id' -d 'davidcps.my.id'
   ```

2. **Configure Nginx** (Already completed):
   ```nginx
   server {
       listen 443 ssl;
       server_name apitaskmanagerv2.davidcps.my.id;

       ssl_certificate /etc/letsencrypt/live/davidcps.my.id/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/davidcps.my.id/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
   }

   server {
       listen 80;
       return 301 https://$host$request_uri;
   }
   ```

3. **Update Cloudflare SSL/TLS Mode** (Already completed):
   - Go to Cloudflare Dashboard → SSL/TLS
   - Change from "Flexible" to "Full (strict)"
   - Verify connection: No 521 errors

4. **Auto-Renewal Setup** (Already completed):
   - Certbot systemd timer enabled
   - Auto-renewal before expiration
   - No manual intervention required

## Consequences

### Positive
- **End-to-end encryption**: Full encryption from browser to origin
- **Improved security**: Meets security best practices for production
- **Compliance**: Better alignment with OWASP and security standards
- **Wildcard certificate**: Single certificate for all subdomains
- **Auto-renewal**: No manual certificate management
- **No disruption**: Cloudflare handles certificate validation

### Negative
- **Certificate management**: Requires certbot and Cloudflare DNS plugin
- **Dependency on Cloudflare DNS**: Certificate renewal requires Cloudflare DNS access
- **Certificate expiration risk**: Auto-renewal must work correctly
- **Nginx configuration**: Additional complexity in SSL termination
- **Backup requirement**: SSL certificate must be backed up with configuration

### Neutral
- **Backend unchanged**: Backend still listens on HTTP 8080 internally
- **No performance impact**: Nginx handles SSL termination efficiently
- **Port requirements**: Both 80 and 443 must be open (already configured)
- **DDNS unaffected**: Dynamic DNS continues to work as before

## Alternatives Considered

### Alternative 1: Stay with Flexible Mode
**Pros:**
- No SSL certificate required
- Simpler setup
- Less infrastructure complexity

**Cons:**
- Partial encryption only
- Not recommended for production
- Security risk if Cloudflare is compromised

**Rejected**: Security requirements demand end-to-end encryption for production.

### Alternative 2: Use Full Mode (non-strict)
**Pros:**
- End-to-end encryption
- Self-signed certificate acceptable

**Cons:**
- Self-signed certificate not ideal for production
- Requires manual certificate trust configuration
- Cloudflare may warn about self-signed certificates

**Rejected**: Full (strict) with valid certificate is better security practice.

### Alternative 3: Use Paid SSL Certificate (DigiCert, etc.)
**Pros:**
- Premium support
- Warranty included
- No dependency on Let's Encrypt

**Cons:**
- Additional cost
- Manual renewal required
- No significant benefit over Let's Encrypt for this use case

**Rejected**: Let's Encrypt wildcard is free, reliable, and sufficient for this project.

## Supersedes

This ADR supersedes the SSL/TLS mode decision in ADR 0002 (Technology Stack Selection).

- **ADR 0002 Status**: Superseded by ADR 0004
- **Reason**: SSL certificate now available, upgrade to Full Strict mode

## References

- [ADR 0002: Technology Stack Selection](../global/0002-technology-stack-selection.md) - Original decision for Flexible mode
- [Infrastructure & Network Architecture](../infrastructure-&-network.md) - Current SSL/TLS configuration
- [Security & Compliance](../security-&-compliance.md) - Security requirements
- [AGENTS.md](../../../../AGENTS.md) - SSL certificate setup procedures
- [Cloudflare SSL/TLS Documentation](https://developers.cloudflare.com/ssl/tls-configuration/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
