/docs

├── README.md                           # Documentation Home (Daftar isi utama \& High-Level FAQ)

│

├── /architecture                       # MACRO ARCHITECTURE (Ex-SAD)

│   ├── system-overview.md              # System C4 Model Diagram (Context \& Container)

│   ├── infrastructure-\&-network.md     # Cloud topology (AWS/GCP), VPC, CDN, CI/CD pipeline

│   ├── security-\&-compliance.md        # Auth strategy (OAuth2/JWT), Data encryption, GDPR/ISO

│   └── disaster-recovery.md            # RTO/RPO targets, Backup strategies, Failover steps

│

├── /backend-spec                       # BACKEND TECHNICAL DESIGN (Ex-SDD Backend)

│   ├── README.md                       # Backend tech stack, Directory conventions, Coding standards

│   ├── database-schema.md              # ERD (Mermaid.js), Migration rules, Caching strategy (Redis)

│   ├── background-jobs.md              # Message brokers (RabbitMQ/Kafka), Cron schedules

│   └── /services                       # Module-specific design (only for complex logic)

│       ├── auth-service.md

│       └── payment-service.md

│

├── /frontend-spec                      # FRONTEND TECHNICAL DESIGN (Ex-SDD Frontend)

│   ├── README.md                       # Frontend tech stack, Rendering strategy (SSR/SPA)

│   ├── state-management.md             # Client-side data flow (Zustand/Redux), Hydration rules

│   ├── design-system-\&-ui.md           # Component anatomy, Theme tokens, Accessibility (WCAG)

│   └── routing-\&-middleware.md         # Route mapping, Navigation guards, Code-splitting rules

│

├── /api-specs                          # TRUTH CONTRACTS (Jantung Spec-Driven Development)

│   ├── openapi.yaml                    # REST API specifications (Swagger format)

│   ├── asyncapi.yaml                   # Event-driven specifications (Websockets/Webhooks)

│   └── error-codes.md                  # Global error dictionary (Standardized error payloads)

│

├── /adr                                # ARCHITECTURE DECISION RECORDS (Lightweight logs)

│   ├── 0000-template.md                # Standard ADR template

│   ├── 0001-record-architecture-decisions.md

│   ├── 0002-adopt-monorepo-structure.md

│   └── 0003-use-postgresql-for-core-ledger.md

│

└── /guides                             # OPERATION \& ONBOARDING PADS

&#x20;   ├── local-setup.md                  # Step-by-step local environment spinning (Docker)

&#x20;   ├── git-workflow.md                 # Branch naming (Gitflow/Trunk-based), Conventional commits

&#x20;   └── release-\&-deployment.md         # Staging/Prod release checklists, Rollback procedures







Prinsip Keterpisahan Perhatian (Separation of Concerns):

&#x09;• Folder /architecture hanya bicara soal apa komponennya dan mengapa dipilih.

&#x09;• Folder /backend-spec dan /frontend-spec bicara soal bagaimana masing-masing platform mengimplementasikannya secara internal.

