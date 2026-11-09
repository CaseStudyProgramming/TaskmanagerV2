# Documentation

This directory contains comprehensive documentation for the Advanced Task Manager project following global standards for senior developers.

## Structure

```
docs/
├── README.md                           # This file
├── prd.md                              # Product Requirements Document
├── CREDENTIALS_GUIDE.md                # Credentials and environment management
├── credentials.md.example              # Credentials template (committed)
├── design DiC.md                       # Documentation design specification
│
├── /architecture                       # MACRO ARCHITECTURE (Ex-SAD)
│   ├── system-overview.md              # System C4 Model Diagram (Context & Container)
│   ├── infrastructure-&-network.md      # Cloud topology, VPC, CDN, CI/CD pipeline
│   ├── security-&-compliance.md        # Auth strategy, Data encryption, GDPR/ISO
│   └── disaster-recovery.md            # RTO/RPO targets, Backup strategies, Failover steps
│
├── /backend-spec                       # BACKEND TECHNICAL DESIGN (Ex-SDD Backend)
│   ├── README.md                       # Backend tech stack, Directory conventions, Coding standards
│   ├── database-schema.md              # ERD (Mermaid.js), Migration rules, Caching strategy (Redis)
│   ├── background-jobs.md              # Message brokers, Cron schedules
│   ├── /adr                            # Backend architecture decisions
│   └── /services                       # Module-specific design (only for complex logic)
│       ├── auth-service.md             # Authentication service design
│       └── payment-service.md         # Payment service design (future)
│
├── /database-spec                      # DATABASE TECHNICAL DESIGN
│   ├── README.md                       # Database tech stack, migration strategy
│   └── /adr                            # Database architecture decisions
│
├── /frontend-spec                      # FRONTEND TECHNICAL DESIGN (Ex-SDD Frontend)
│   ├── README.md                       # Frontend tech stack, Rendering strategy (SSR/SPA)
│   ├── state-management.md             # Client-side data flow, Hydration rules
│   ├── design-system-&-ui.md           # Component anatomy, Theme tokens, Accessibility (WCAG)
│   ├── routing-&-middleware.md         # Route mapping, Navigation guards, Code-splitting rules
│   └── /adr                            # Frontend architecture decisions
│
├── /api-specs                          # TRUTH CONTRACTS (Jantung Spec-Driven Development)
│   ├── openapi.yaml                    # REST API specifications (Swagger format)
│   ├── standard-response-format.md     # API response specification
│   ├── API_VALIDATION.md               # API validation rules
│   └── error-codes.md                  # Global error dictionary (Standardized error payloads)
│
├── /examples                           # CODE EXAMPLES (Reference implementations)
│   ├── README.md                       # Examples overview and usage
│   ├── /backend-implementation         # Backend Go implementation examples
│   │   ├── entity-example.go           # Domain entity implementation
│   │   ├── repository-example.go       # Repository interface definition
│   │   └── handler-example.go          # HTTP handler implementation
│   ├── /api-implementation             # API response helper implementations
│   │   ├── go-response-helper.go      # Go response helper functions
│   │   └── typescript-response-helper.ts  # TypeScript response helper functions
│   └── /infrastructure                 # Infrastructure configuration examples
│       ├── dockerfile.example         # Docker container configuration
│       └── ci-cd-workflow.example     # CI/CD workflow configuration
│
├── /adr                                # ARCHITECTURE DECISION RECORDS (Lightweight logs)
│   ├── 0000-template.md                # Standard ADR template
│   ├── README.md                       # Central ADR index
│   ├── global/                         # Cross-cutting decisions
│   └── infrastructure/                 # Deployment, CI/CD, cloud, networking
│
├── /guides                             # OPERATION & ONBOARDING PADS
│   ├── local-setup.md                  # Step-by-step local environment spinning (Docker)
│   ├── git-workflow.md                 # Branch naming, Conventional commits
│   └── release-&-deployment.md         # Staging/Prod release checklists, Rollback procedures
│
└── /tdd                                # LEGACY: Technical Design Documentation (to be migrated)
    ├── README.md
    ├── architecture/
    ├── ci-cd/
    ├── project/
    ├── quality-reliability/
    └── testing/
```

## Quick Links

### Getting Started
- [Product Requirements Document (PRD)](./prd.md) - Product requirements and specifications
- [Local Setup Guide](./guides/local-setup.md) - Quick start development setup
- [Credentials Guide](./CREDENTIALS_GUIDE.md) - Credentials and security management
- [Implementation Tutorials](./guides/) - Step-by-step implementation guides

### Architecture (Macro)
- [System Overview](./architecture/system-overview.md) - C4 Model Diagram (Context & Container)
- [Infrastructure & Network](./architecture/infrastructure-&-network.md) - Cloud topology, VPC, CDN, CI/CD
- [Security & Compliance](./architecture/security-&-compliance.md) - Auth strategy, encryption, GDPR/ISO
- [Disaster Recovery](./architecture/disaster-recovery.md) - RTO/RPO, backup strategies, failover

### Backend Technical Design
- [Backend Overview](./backend-spec/README.md) - Backend tech stack, conventions, standards
- [Database Schema](./backend-spec/database-schema.md) - ERD, migrations, caching strategy
- [Background Jobs](./backend-spec/background-jobs.md) - Message brokers, cron schedules
- [Auth Service](./backend-spec/services/auth-service.md) - Authentication service design
- [Payment Service](./backend-spec/services/payment-service.md) - Payment service design (future)

### Frontend Technical Design
- [Frontend Overview](./frontend-spec/README.md) - Frontend tech stack, rendering strategy
- [State Management](./frontend-spec/state-management.md) - Client-side data flow, hydration rules
- [Design System & UI](./frontend-spec/design-system-&-ui.md) - Component anatomy, theme tokens, WCAG
- [Routing & Middleware](./frontend-spec/routing-&-middleware.md) - Route mapping, navigation guards

### API Specifications
- [OpenAPI Specification](./api-specs/openapi.yaml) - Complete API contract
- [Standard Response Format](./api-specs/standard-response-format.md) - API response specification
- [API Validation](./api-specs/API_VALIDATION.md) - API validation rules
- [Error Codes](./api-specs/error-codes.md) - Global error dictionary

### Code Examples
- [Examples Overview](./examples/README.md) - Code examples overview and usage
- [Backend Implementation](./examples/backend-implementation/) - Backend Go implementation examples
- [API Implementation](./examples/api-implementation/) - API response helper implementations
- [Infrastructure Examples](./examples/infrastructure/) - Docker and CI/CD configuration examples

### Architecture Decision Records (ADR)
- [ADR Index](./techincal-design/adr/README.md) - Central ADR index and overview
- [ADR Template](./techincal-design/adr/0000-template.md) - Standard ADR template
- [Record Architecture Decisions](./techincal-design/adr/global/0001-record-architecture-decisions.md) - ADR adoption decision
- [Technology Stack Selection](./techincal-design/adr/global/0002-technology-stack-selection.md) - Technology stack decision
- [Use PostgreSQL for Core Database](./techincal-design/database-spec/adr/0003-use-postgresql-for-core-ledger.md) - Database selection decision

### Operation & Onboarding
- [Local Setup](./guides/local-setup.md) - Step-by-step local environment setup
- [Git Workflow](./guides/git-workflow.md) - Branch naming, conventional commits
- [Release & Deployment](./guides/release-&-deployment.md) - Release checklists, rollback procedures

### Implementation Tutorials
- [Implementing Backend Entities](./guides/implementing-backend-entity.md) - How to implement domain entities
- [Implementing API Handlers](./guides/implementing-api-handler.md) - How to implement HTTP handlers

### Legacy Documentation (to be migrated)
- [Legacy TDD Documentation](./tdd/README.md) - Legacy technical design documentation

## Documentation Standards

### When to Add Documentation

1. **New Features**: Add architecture documentation before implementation
2. **API Changes**: Update API documentation immediately
3. **Architecture Decisions**: Document significant decisions as ADRs
4. **Infrastructure Changes**: Update infrastructure documentation
5. **Security Changes**: Update security documentation

### Documentation Format

- Use Markdown for all documentation
- Use proper heading hierarchy (H1, H2, H3)
- Include diagrams for complex architectures (Mermaid.js)
- Keep documentation up-to-date with code changes
- Follow the design specification in [design DiC.md](./design DiC.md)

### Review Process

1. Documentation should be reviewed as part of PR reviews
2. Major documentation changes require team approval
3. Update documentation references when files are moved or renamed
4. Remove outdated documentation to avoid confusion

## Contributing

When adding new documentation:

1. Choose the appropriate directory (architecture, backend-spec, frontend-spec, api-specs, adr, guides)
2. Use clear, descriptive filenames
3. Include a table of contents for longer documents
4. Add cross-references to related documentation
5. Update this README.md with new documentation links
6. Follow the design specification in [design DiC.md](./design DiC.md)

## Maintenance

Documentation maintenance is part of the development process:

- Review documentation monthly for accuracy
- Update documentation when APIs change
- Remove deprecated documentation
- Document known issues and workarounds
- Migrate legacy documentation to new structure

## Principles

### Separation of Concerns

- **Folder /architecture**: Only discusses what components are and why they were chosen
- **Folder /backend-spec**: Discusses how the backend platform implements architecture internally (design decisions, no full implementation)
- **Folder /frontend-spec**: Discusses how the frontend platform implements architecture internally (design decisions, no full implementation)
- **Folder /examples**: Contains complete implementation examples for reference
- **Folder /guides**: Operational procedures and onboarding tutorials

### Documentation Philosophy

- **Architecture**: High-level design decisions and rationale
- **Backend-spec**: Technical design details for backend (what and why, not full how)
- **Frontend-spec**: Technical design details for frontend (what and why, not full how)
- **API-specs**: Truth contracts for API (spec-driven development)
- **Examples**: Complete implementation examples (reference code)
- **ADR**: Lightweight logs of architecture decisions
- **Guides**: Operation and onboarding procedures (step-by-step)

## References

- [Design Specification](./design DiC.md) - Documentation design and structure
- [Product Requirements Document](./prd.md) - Product requirements and specifications
