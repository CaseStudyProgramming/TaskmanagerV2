# Git Workflow

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Draft

---

## Overview

This document describes the branch naming strategy, conventional commits, and Git workflow for the Advanced Task Manager project.

---

## Branch Strategy

### Branch Model

**Main Branches:**
- `main` - Production-ready code
- `develop` - Integration branch for features

**Supporting Branches:**
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes
- `release/*` - Release preparation

### Branch Naming

| Branch Type | Pattern | Example |
|--------------|---------|---------|
| **Feature** | `feature/description` | `feature/task-priority-scoring` |
| **Bugfix** | `bugfix/description` | `bugfix/login-token-expiry` |
| **Hotfix** | `hotfix/description` | `hotfix/security-patch` |
| **Release** | `release/version` | `release/v1.0.0` |

### Branch Rules

1. **main branch**
   - Always production-ready
   - Protected branch (requires PR)
   - Tags for releases (v1.0.0, v1.1.0, etc.)

2. **develop branch**
   - Integration branch for features
   - Features merged from feature branches
   - Never push directly to develop

3. **feature branches**
   - Created from develop
   - Merged back to develop via PR
   - Delete after merge

4. **hotfix branches**
   - Created from main
   - Merged back to main and develop
   - Delete after merge

---

## Conventional Commits

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Test additions or changes |
| `chore` | Build process or auxiliary tool changes |
| `ci` | CI/CD changes |
| `revert` | Revert previous commit |

### Scopes

Common scopes:
- `backend` - Backend changes
- `frontend` - Frontend changes
- `api` - API changes
- `db` - Database changes
- `infra` - Infrastructure changes
- `docs` - Documentation changes
- `test` - Test changes

### Examples

**Feature:**
```
feat(backend): add task priority scoring algorithm

- Implement rule-based priority scoring
- Add due date proximity weight
- Add task age weight
- Add tag importance weight

Closes #123
```

**Bugfix:**
```
fix(frontend): resolve token refresh loop

- Fix infinite loop in token refresh
- Add proper error handling
- Update session timeout logic

Fixes #456
```

**Documentation:**
```
docs(readme): update installation instructions

- Add Bun installation steps
- Update environment setup
- Add troubleshooting section
```

**Refactor:**
```
refactor(backend): extract user service from auth handler

- Move user logic to dedicated service
- Improve testability
- Reduce handler complexity
```

---

## Workflow

### Feature Development

1. **Create feature branch from develop:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/task-priority-scoring
```

2. **Make changes and commit:**
```bash
git add .
git commit -m "feat(backend): add task priority scoring algorithm"
```

3. **Push to GitHub:**
```bash
git push origin feature/task-priority-scoring
```

4. **Create PR on GitHub:**
- Target: `develop` branch
- Title: Feature: Task priority scoring
- Description: Include commits and issue reference

5. **Review and merge:**
- Code review by team
- CI/CD checks must pass
- Merge with squash commit

6. **Delete feature branch:**
```bash
git branch -d feature/task-priority-scoring
git push origin --delete feature/task-priority-scoring
```

### Bugfix Development

1. **Create bugfix branch from develop:**
```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/login-token-expiry
```

2. **Make changes and commit:**
```bash
git add .
git commit -m "fix(frontend): resolve token refresh loop"
```

3. **Push to GitHub:**
```bash
git push origin bugfix/login-token-expiry
```

4. **Create PR on GitHub:**
- Target: `develop` branch
- Title: Fix: Login token expiry
- Description: Include commits and issue reference

5. **Review and merge:**
- Code review by team
- CI/CD checks must pass
- Merge with squash commit

6. **Delete bugfix branch:**
```bash
git branch -d bugfix/login-token-expiry
git push origin --delete bugfix/login-token-expiry
```

### Hotfix Development

1. **Create hotfix branch from main:**
```bash
git checkout main
git pull origin main
git checkout -b hotfix/security-patch
```

2. **Make changes and commit:**
```bash
git add .
git commit -m "fix(security): patch XSS vulnerability"
```

3. **Push to GitHub:**
```bash
git push origin hotfix/security-patch
```

4. **Create PR on GitHub:**
- Target: `main` branch
- Title: Hotfix: Security patch
- Description: Include commits and issue reference

5. **Review and merge:**
- Code review by team
- CI/CD checks must pass
- Merge with squash commit

6. **Merge to develop:**
```bash
git checkout develop
git merge hotfix/security-patch
git push origin develop
```

7. **Delete hotfix branch:**
```bash
git branch -d hotfix/security-patch
git push origin --delete hotfix/security-patch
```

### Release

1. **Create release branch from develop:**
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
```

2. **Update version numbers:**
- Update package.json (frontend)
- Update go.mod (backend)
- Update documentation

3. **Commit version changes:**
```bash
git add .
git commit -m "chore(release): bump version to 1.0.0"
```

4. **Push to GitHub:**
```bash
git push origin release/v1.0.0
```

5. **Create PR on GitHub:**
- Target: `main` branch
- Title: Release: v1.0.0
- Description: Include changelog

6. **Review and merge:**
- Code review by team
- CI/CD checks must pass
- Merge with squash commit

7. **Tag release:**
```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

8. **Merge back to develop:**
```bash
git checkout develop
git merge release/v1.0.0
git push origin develop
```

9. **Delete release branch:**
```bash
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

---

## Git Hooks

### Pre-commit Hook

**Purpose:** Run linting and formatting before commit

**Installation:**
```bash
# Install husky
npm install -g husky

# Initialize
cd /path/to/repo
husky install

# Add pre-commit hook
husky add .husky/pre-commit "bun run lint && bun run format"
```

### Pre-push Hook

**Purpose:** Run tests before push

**Installation:**
```bash
husky add .husky/pre-push "bun run test"
```

### Commit Message Hook

**Purpose:** Enforce conventional commits

**Installation:**
```bash
npm install -g @commitlint/cli @commitlint/config-conventional
husky add .husky/commit-msg 'commitlint --edit $1'
```

**Configuration:**
```json
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'revert']],
    'scope-enum': [2, 'always', ['backend', 'frontend', 'api', 'db', 'infra', 'docs', 'test']],
  },
};
```

---

## References

- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message specification
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) - Branching model
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [Commitlint](https://commitlint.js.org/) - Commit message linting
