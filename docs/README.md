# Documentation

This directory contains comprehensive documentation for the Advanced Task Manager project following global standards for senior developers.

## Structure

```
docs/
├── README.md                    # This file
├── prd.md                       # Product Requirements Document
└── tdd/                         # Technical Design Documentation
    ├── README.md                # TDD navigation and overview
    ├── architecture/            # Architecture documentation
    │   ├── backend-ddd.md       # Backend DDD architecture + interactions
    │   ├── frontend-fsd.md      # Frontend FSD architecture + interactions
    │   └── container-strategy.md # Container platform strategy
    ├── api/                     # API documentation
    │   ├── openapi.yaml         # OpenAPI 3.1 specification
    │   ├── standard-response-format.md # API response specification
    │   └── API_VALIDATION.md    # API validation rules
    ├── ci-cd/                   # CI/CD documentation
    │   ├── workflow.md          # Development workflow
    │   ├── coverage-strategy.md # Coverage thresholds
    │   └── github-actions.md   # CI/CD pipeline config
    ├── project/                 # Project-level documentation
    │   ├── dependencies.md     # Dependency versions + tech rationale
    │   ├── test-driven-development.md # Testing guidelines
    │   └── future-roadmap.md   # Future enhancements roadmap
    ├── quality-reliability/     # Quality & reliability
    │   ├── backend-quality-reliability.md # Backend quality + caching
    │   ├── frontend-quality-reliability.md # Frontend quality
    │   ├── container-recommendations.md # Container best practices
    │   └── risk-assessment.md  # Technical and business risks
    └── testing/                 # Testing documentation
        ├── backend-examples.md  # Backend testing examples
        └── frontend-examples.md # Frontend testing examples
```

## Quick Links

### Project Documentation
- [Product Requirements Document (PRD)](./prd.md) - Product requirements and specifications
- [Test-Driven Development Guidelines](./tdd/project/test-driven-development.md) - Testing guidelines and standards
- [Dependency Versions](./tdd/project/dependencies.md) - Backend and frontend dependency versions
- [Future Roadmap](./tdd/project/future-roadmap.md) - Scalability and feature enhancements

### Architecture
- [Backend DDD Architecture](./tdd/architecture/backend-ddd.md) - Domain-Driven Design for backend
- [Frontend FSD Architecture](./tdd/architecture/frontend-fsd.md) - Feature-Sliced Design for frontend
- [Container Strategy](./tdd/architecture/container-strategy.md) - Container platform strategy

### API
- [OpenAPI 3.1 Specification](./tdd/api/openapi.yaml) - Complete API contract
- [Standard Response Format](./tdd/api/standard-response-format.md) - API response specification
- [API Validation](./tdd/api/API_VALIDATION.md) - API validation rules

### Testing
- [Backend Testing Examples](./tdd/testing/backend-examples.md) - Go testing examples
- [Frontend Testing Examples](./tdd/testing/frontend-examples.md) - TypeScript/Svelte testing examples

### CI/CD
- [Development Workflow](./tdd/ci-cd/workflow.md) - Complete development workflow and quality gates
- [Coverage Strategy](./tdd/ci-cd/coverage-strategy.md) - Hierarchical coverage thresholds and enforcement
- [GitHub Actions Configuration](./tdd/ci-cd/github-actions.md) - CI/CD pipeline configuration

### Quality & Reliability
- [Backend Quality & Reliability](./tdd/quality-reliability/backend-quality-reliability.md) - Backend system quality requirements
- [Frontend Quality & Reliability](./tdd/quality-reliability/frontend-quality-reliability.md) - Frontend system quality requirements
- [Container Recommendations](./tdd/quality-reliability/container-recommendations.md) - Docker container and Alpine Linux recommendations
- [Risk Assessment](./tdd/quality-reliability/risk-assessment.md) - Technical and business risks

## Documentation Standards

### When to Add Documentation

1. **New Features**: Add architecture documentation before implementation
2. **API Changes**: Update API documentation immediately
3. **Testing Patterns**: Add examples for new testing approaches
4. **CI/CD Changes**: Update pipeline documentation
5. **Architecture Decisions**: Document significant architectural decisions

### Documentation Format

- Use Markdown for all documentation
- Use proper heading hierarchy (H1, H2, H3)
- Include diagrams for complex architectures
- Keep documentation up-to-date with code changes

### Review Process

1. Documentation should be reviewed as part of PR reviews
2. Major documentation changes require team approval
3. Update documentation references when files are moved or renamed
4. Remove outdated documentation to avoid confusion

## Contributing

When adding new documentation:

1. Choose the appropriate directory (project, architecture, api, testing, ci-cd, quality-reliability)
2. Use clear, descriptive filenames
3. Include a table of contents for longer documents
4. Add cross-references to related documentation
5. Update this README.md with new documentation links

## Maintenance

Documentation maintenance is part of the development process:

- Review documentation monthly for accuracy
- Update documentation when APIs change
- Remove deprecated documentation
- Keep examples current with latest codebase
- Document known issues and workarounds