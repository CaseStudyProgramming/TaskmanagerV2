# System Architecture Decision Records

This folder contains ADRs specific to system architecture, including cross-cutting global decisions and infrastructure decisions for the Advanced Task Manager.

## Structure

```
architecture/adr/
├── global/              # Cross-cutting decisions (process, meta, overall architecture)
└── infrastructure/      # Deployment, CI/CD, cloud, networking decisions
```

## ADR Index

### Global
Cross-cutting decisions that affect the entire project.

| ID | Title | Status | Date |
|----|-------|--------|------|
| [0001](global/0001-record-architecture-decisions.md) | Record Architecture Decisions | Accepted | 2026-11-09 |
| [0002](global/0002-technology-stack-selection.md) | Technology Stack Selection | Superseded (partially) | 2026-11-09 |

### Infrastructure
Deployment, CI/CD, cloud, and networking decisions.

| ID | Title | Status | Date |
|----|-------|--------|------|
| [0004](infrastructure/0004-upgrade-to-cloudflare-full-strict-ssl.md) | Upgrade to Cloudflare Full Strict SSL/TLS Mode | Accepted | 2026-11-09 |
| [0005](infrastructure/0005-migrate-to-oci-container-registry.md) | Migrate to OCI Container Registry | Accepted | 2026-11-09 |

## Creating a New System Architecture ADR

1. Copy the template from `../../adr/0000-template.md`
2. Place it in the appropriate subfolder:
   - Global decisions: `global/`
   - Infrastructure decisions: `infrastructure/`
3. Use the next sequential number
4. Fill in the template following the Michael Nygard format
5. Update the central ADR index at `../../adr/README.md`

## Related Documentation

- [Central ADR Index](../../adr/README.md)
- [System Overview](../system-overview.md)
- [Infrastructure & Network](../infrastructure-&-network.md)
- [Security & Compliance](../security-&-compliance.md)
- [Disaster Recovery](../disaster-recovery.md)
- [Dependency Versions](../dependencies.md)
