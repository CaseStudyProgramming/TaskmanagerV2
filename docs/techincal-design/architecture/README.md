# System Architecture

This folder contains macro-level architecture documentation for the Advanced Task Manager project.

## Structure

```
architecture/
├── README.md                    # This file
├── adr/                         # Architecture Decision Records
│   ├── global/                 # Cross-cutting architecture decisions
│   └── infrastructure/         # Infrastructure architecture decisions
├── system-overview.md          # C4 Model Diagram (Context & Container)
├── infrastructure-&-network.md  # Cloud topology, VPC, CDN, CI/CD pipeline
├── security-&-compliance.md    # Auth strategy, Data encryption, GDPR/ISO
└── disaster-recovery.md        # RTO/RPO targets, Backup strategies, Failover steps
```

## Architecture Decision Records

See [architecture/adr/README.md](./adr/README.md) for system architecture ADRs.

## Documentation

- [System Overview](./system-overview.md) - C4 Model Diagram (Context & Container)
- [Infrastructure & Network](./infrastructure-&-network.md) - Cloud topology, VPC, CDN, CI/CD
- [Security & Compliance](./security-&-compliance.md) - Auth strategy, encryption, GDPR/ISO
- [Disaster Recovery](./disaster-recovery.md) - RTO/RPO, backup strategies, failover

## Related Documentation

- [Central ADR Index](../adr/README.md)
- [Backend Specifications](../backend-spec/README.md)
- [Frontend Specifications](../frontend-spec/README.md)
- [Database Specifications](../database-spec/README.md)
