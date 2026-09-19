# Documentation

This directory contains comprehensive documentation for the Advanced Task Manager project.

## Structure

```
docs/
├── README.md                    # This file
├── testing/                     # Testing documentation
│   ├── backend-examples.md     # Backend testing examples
│   └── frontend-examples.md    # Frontend testing examples
├── ci-cd/                       # CI/CD documentation
│   └── github-actions.md       # GitHub Actions configuration
├── architecture/               # Architecture documentation
│   ├── backend-ddd.md          # Backend DDD architecture
│   └── frontend-fsd.md         # Frontend FSD architecture
├── api/                         # API documentation
│   └── standard-response-format.md  # API response format
└── quality-reliability/        # System Quality & Reliability
    ├── backend-quality-reliability.md  # Backend quality requirements
    ├── frontend-quality-reliability.md # Frontend quality requirements
    └── container-recommendations.md   # Container and Alpine recommendations
```

## Quick Links

### Product & Requirements
- [PRD.md](../PRD.md) - Product Requirements Document
- [TDD.md](../TDD.md) - Test-Driven Development Guidelines

### Testing
- [Backend Testing Examples](./testing/backend-examples.md) - Go testing examples
- [Frontend Testing Examples](./testing/frontend-examples.md) - TypeScript/Svelte testing examples

### CI/CD
- [GitHub Actions Configuration](./ci-cd/github-actions.md) - Complete CI/CD pipeline setup

### Architecture
- [Backend DDD Architecture](./architecture/backend-ddd.md) - Domain-Driven Design for backend
- [Frontend FSD Architecture](./architecture/frontend-fsd.md) - Feature-Sliced Design for frontend

### API
- [Standard Response Format](./api/standard-response-format.md) - API response specification

### Quality & Reliability
- [Backend Quality & Reliability](./quality-reliability/backend-quality-reliability.md) - Backend system quality requirements
- [Frontend Quality & Reliability](./quality-reliability/frontend-quality-reliability.md) - Frontend system quality requirements
- [Container Recommendations](./quality-reliability/container-recommendations.md) - Docker container and Alpine Linux recommendations

## Documentation Standards

### When to Add Documentation

1. **New Features**: Add architecture documentation before implementation
2. **API Changes**: Update API documentation immediately
3. **Testing Patterns**: Add examples for new testing approaches
4. **CI/CD Changes**: Update pipeline documentation
5. **Architecture Decisions**: Document significant architectural decisions

### Documentation Format

- Use Markdown for all documentation
- Include code examples where helpful
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

1. Choose the appropriate directory (testing, ci-cd, architecture, api, quality-reliability)
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
