# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records (ADRs) for the Advanced Task Manager project. ADRs document significant architectural decisions, their rationale, and consequences.

## Structure

ADRs are organized by scope to help developers quickly find relevant decisions:

```
docs/techincal-design/
├── adr/                          # Central ADR folder (global & infrastructure)
│   ├── 0000-template.md         # Template for new ADRs
│   ├── README.md                # This file
│   ├── global/                  # Cross-cutting decisions (process, meta, overall architecture)
│   └── infrastructure/          # Deployment, CI/CD, cloud, networking decisions
├── backend-spec/
│   └── adr/                     # Backend-specific decisions
├── frontend-spec/
│   └── adr/                     # Frontend-specific decisions
└── database-spec/
    └── adr/                     # Database, caching, storage decisions
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

### Database
Database, caching, and storage decisions.

| ID | Title | Status | Date |
|----|-------|--------|------|
| [0003](../database-spec/adr/0003-use-postgresql-for-core-ledger.md) | Use PostgreSQL for Core Database | Accepted | 2026-11-09 |

### Backend
Backend-specific decisions (services, architecture, patterns).

*No ADRs yet.*

### Frontend
Frontend-specific decisions (framework, architecture, patterns).

*No ADRs yet.*

## Creating a New ADR

1. Copy the template: `adr/0000-template.md`
2. Place it in the appropriate scope folder:
   - **Global/Infrastructure**: `adr/global/` or `adr/infrastructure/`
   - **Backend**: `backend-spec/adr/`
   - **Frontend**: `frontend-spec/adr/`
   - **Database**: `database-spec/adr/`
3. Use the next sequential number (last ADR is 0005, so next is 0006)
4. Fill in the template following the Michael Nygard format
5. Update this README to include the new ADR in the index

## ADR Status

- **Proposed**: Decision is being discussed
- **Accepted**: Decision has been implemented
- **Deprecated**: Decision is no longer recommended
- **Superseded**: Decision has been replaced by another ADR

## Related Documentation

- [Technical Design Overview](../README.md)
- [System Architecture](../architecture/system-overview.md)
- [Infrastructure & Network](../architecture/infrastructure-&-network.md)
- [API Specifications](../api-specs/API_SPECIFICATIONS.md)
- [Backend Specifications](../backend-spec/README.md)
- [Frontend Specifications](../frontend-spec/README.md)
