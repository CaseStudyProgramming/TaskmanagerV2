# ADR 0003: Use PostgreSQL for Core Database

**Status**: Accepted

**Date**: 2026-11-09

**Context**: We need to select a database for the Advanced Task Manager that supports our data model, provides good performance, and integrates well with our technology stack.

**Decision**: Use Neon PostgreSQL as the primary database with branch-first workflow for development and testing.

**Consequences**: PostgreSQL provides excellent features, performance, and reliability. Neon's branch-first workflow enables isolated development and testing environments.

---

## Context

The Advanced Task Manager requires:
- Relational data model (users, tasks, sessions)
- ACID transactions for data integrity
- Complex queries (filtering, sorting, searching)
- Scalability for future growth
- Good developer experience

We evaluated multiple database options including PostgreSQL, MySQL, MongoDB, and self-hosted solutions.

## Decision

We will use PostgreSQL as the primary database, hosted on Neon with the following configuration:

### Database Instances
- **Production**: `taskmanager_db` (Neon branch: main)
- **Testing**: `taskmanager_db_testing` (Neon branch: testing)
- **Development**: `taskmanager_db_dev` (Neon branch: dev)

**Note on Testing vs Development Branches:**
- For solo development, testing and development branches can be combined to reduce costs
- For team collaboration or CI/CD automation, keeping them separate is recommended to avoid data conflicts
- Current configuration uses separate branches for better isolation in production-ready setup

### Key Features
- **Branch-first workflow**: Isolated environments for development and testing
- **Automatic scaling**: Scales based on load
- **Point-in-time recovery**: Restore to any point in time (up to 7 days)
- **Automatic backups**: Daily backups with 7-day retention
- **Serverless**: Pay only for what you use

### Why PostgreSQL?
- Advanced features (JSON, arrays, full-text search)
- Excellent query optimizer
- Strong ACID compliance
- Mature ecosystem and tooling
- Excellent performance
- Open source and community-driven

### Why Neon?
- Branch-first workflow (isolated dev/test environments)
- Serverless architecture (cost-effective)
- Automatic scaling (no manual intervention)
- Excellent developer experience
- Integrated with our Go + SQLBoiler stack

## Consequences

**Positive:**
- Excellent database features and performance
- Isolated development and testing environments
- Automatic scaling and backups
- Cost-effective (serverless pricing)
- Great developer experience
- Point-in-time recovery for disaster recovery

**Negative:**
- Cloud-only (no self-hosting option)
- Requires internet connectivity
- Vendor lock-in (Neon-specific features)
- Branch workflow requires discipline

**Neutral:**
- PostgreSQL learning curve for some developers
- Neon dashboard for management (no CLI-first approach)

## Alternatives Considered

1. **Self-hosted PostgreSQL**
   - Rejected: Higher operational overhead, no branch workflow

2. **MySQL**
   - Rejected: Less advanced features, weaker JSON support

3. **MongoDB**
   - Rejected: Less structured, schema changes harder, no ACID transactions

4. **SQLite**
   - Rejected: Not suitable for production multi-user application

5. **Amazon RDS PostgreSQL**
   - Rejected: More expensive, no branch workflow, requires manual scaling

## References

- [ADR 0002: Technology Stack Selection](../architecture/adr/global/0002-technology-stack-selection.md) - Overall technology stack context
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Documentation](https://neon.tech/docs)
- [SQLBoiler Documentation](https://github.com/volatiletech/sqlboiler)
