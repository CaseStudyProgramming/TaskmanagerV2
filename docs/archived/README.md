# Archived Documentation

This directory contains historical documentation that has been superseded or is no longer active.

## Contents

- **github-actions.md** - Historical GitHub Actions CI/CD configuration. GitHub Actions has been replaced by Forgejo as the primary CI/CD platform.
- **WOODPECKER_MIGRATION.md** - Historical migration from GitHub Actions to Woodpecker CI. Woodpecker has been replaced by Forgejo as the primary CI/CD platform.
- **woodpecker-artifacts.md** - Woodpecker artifact management documentation. Superseded by Forgejo artifacts.
- **woodpecker-artifact-types.md** - Woodpecker artifact types and storage recommendations. Superseded by Forgejo artifact handling.

## Current CI/CD Platform

The project now uses **Forgejo** as the primary CI/CD platform. See:
- [Forgejo CI/CD Configuration](../tdd/ci-cd/forgejo-ci.md)

## Why Archive?

These documents are preserved for historical reference but should not be used for current implementation. They may contain outdated:
- CI/CD platform references
- Configuration examples
- Workflow definitions
- Artifact storage strategies

Always refer to the current documentation in the main `docs/` directory for up-to-date information.
