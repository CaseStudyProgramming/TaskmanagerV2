# Coverage Strategy and Enforcement

This document defines the coverage strategy following global senior developer standards, addressing the controversy between overall coverage vs. business logic coverage.

## The Problem with Overall Coverage Only

### Scenario Analysis

```
Overall coverage: 86% ✅ (meets 85% target)
Business logic: 80% ❌ (below 93% requirement)
Boilerplate: 95% ✅ (brings up average)
Generated code: 100% ✅ (artificially inflates average)

Result with overall-only enforcement: LOLOS ❌
Result with hierarchical enforcement: GAGAL ✅
```

### Why Overall-Only is Problematic

**1. Gaming the System**
- Developers test boilerplate code to meet overall target
- Focus on easy-to-test files instead of critical business logic
- False sense of security

**2. Hidden Business Risks**
- Critical business logic under-tested
- Bugs in core functionality pass CI/CD
- Higher production risk

**3. Resource Misallocation**
- Time spent testing trivial code
- Limited time for testing complex business logic
- Inefficient use of testing resources

**4. False Metrics**
- High overall coverage doesn't equal high code quality
- Stakeholders misled by coverage numbers
- Actual risk masked by average

## Coverage Strategy: Hierarchical Thresholds

### Primary Enforcement Strategy

```yaml
coverage_enforcement:
  # Overall Baseline
  overall_target: 85%
  overall_action: warn_if_below
  
  # Critical Thresholds (Can fail CI even if overall passes)
  critical_thresholds:
    business_logic: 93%
    services_use_cases: 93%
    domain_entities: 93%
    value_objects: 93%
    utilities_helpers: 93%
    critical_action: block_if_below
  
  # Important Thresholds (Warning but don't block)
  important_thresholds:
    api_handlers: 85%
    repository_implementation: 80%
    components_ui: 80%
    important_action: warn_if_below
  
  # Exclusions (Don't count toward overall)
  excluded_categories:
    - type_definitions
    - error_pages
    - boilerplate_code
    - auto_generated
    - configuration_files
    - migration_files
```

### Enforcement Logic

```python
def evaluate_coverage(coverage_report):
    violations = []
    
    # Check overall baseline
    if coverage_report.overall < 85:
        violations.append("OVERALL_COVERAGE_BELOW_THRESHOLD")
    
    # Check critical thresholds (block even if overall passes)
    for category, coverage in coverage_report.critical_categories.items():
        if coverage < 93:
            violations.append(f"CRITICAL_{category.upper()}_BELOW_THRESHOLD")
    
    # Check important thresholds (warning only)
    warnings = []
    for category, coverage in coverage_report.important_categories.items():
        if coverage < get_threshold(category):
            warnings.append(f"IMPORTANT_{category.upper()}_BELOW_THRESHOLD")
    
    return {
        "status": "FAIL" if violations else "PASS",
        "violations": violations,
        "warnings": warnings
    }
```

## File Type Classification

### File Type Categories and Thresholds

| File Type | Threshold | Enforcement | Rationale |
|-----------|-----------|-------------|-----------|
| **Business Logic** | 93% | Block | Core product value, highest risk |
| **Services/Use Cases** | 93% | Block | Critical business operations |
| **Domain Entities** | 93% | Block | Core domain model |
| **Value Objects** | 93% | Block | Domain invariants |
| **Utilities/Helpers** | 93% | Block | Shared functionality, high usage |
| **API Handlers** | 85% | Warn | HTTP layer, can use integration tests |
| **Repository Implementation** | 80% | Warn | Infrastructure, can use integration tests |
| **Components (UI)** | 80% | Warn | Visual testing also important |
| **Middleware** | 75% | Warn | Security-critical but simple |
| **Type Definitions** | Exclude | N/A | No logic to test |
| **Error Pages** | Exclude | N/A | UI-focused, visual testing |
| **Boilerplate Code** | Exclude | N/A | No business value |
| **Auto-generated** | Exclude | N/A | Not human-written |
| **Configuration** | Exclude | N/A | No logic to test |
| **Migration Files** | Exclude | N/A | Database-specific |

### File Classification Examples

**Business Logic (93% required):**
```typescript
// src/features/task-prioritize/model/priority-calculator.ts
// src/entities/task/model/task.ts
// src/shared/lib/validation.ts
// src/shared/lib/time-helpers.ts
```

**API Handlers (85% required):**
```typescript
// src/interfaces/http/task/handler.go
// src/pages/tasks/list/ui/TaskListPage.svelte
```

**Excluded:**
```typescript
// src/shared/types/index.ts (type definitions)
// src/app/routes/routes.ts (configuration)
// internal/generated/ (auto-generated)
```

## Implementation Strategy

### Step 1: Coverage Report Generation

```bash
# Frontend coverage
npm run test:coverage

# Backend coverage
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
```

### Step 2: File Type Analysis

```python
def classify_file(file_path):
    """Classify file based on path and content analysis"""
    
    # Exclusions
    if is_type_definition(file_path):
        return "excluded"
    if is_error_page(file_path):
        return "excluded"
    if is_boilerplate(file_path):
        return "excluded"
    if is_auto_generated(file_path):
        return "excluded"
    
    # Critical categories
    if is_business_logic(file_path):
        return "critical"
    if is_service_or_use_case(file_path):
        return "critical"
    if is_domain_entity(file_path):
        return "critical"
    if is_value_object(file_path):
        return "critical"
    if is_utility_or_helper(file_path):
        return "critical"
    
    # Important categories
    if is_api_handler(file_path):
        return "important"
    if is_repository_implementation(file_path):
        return "important"
    if is_ui_component(file_path):
        return "important"
    
    return "other"
```

### Step 3: Threshold Enforcement

```yaml
# .github/workflows/ci.yml
coverage-analysis:
  runs-on: ubuntu-latest
  steps:
    - name: Generate coverage report
      run: |
        npm run test:coverage
        go test ./... -coverprofile=coverage.out
    
    - name: Analyze coverage by file type
      run: |
        python scripts/analyze_coverage.py coverage.out
    
    - name: Check critical thresholds
      run: |
        if [ $BUSINESS_LOGIC_COVERAGE -lt 93 ]; then
          echo "FAIL: Business logic coverage $BUSINESS_LOGIC_COVERAGE% below 93%"
          exit 1
        fi
    
    - name: Check overall baseline
      run: |
        if [ $OVERALL_COVERAGE -lt 85 ]; then
          echo "WARN: Overall coverage $OVERALL_COVERAGE% below 85%"
          # Don't fail, just warn
        fi
```

## CI/CD Implementation

### Multi-Stage Coverage Check

```yaml
coverage-analysis:
  name: Coverage Analysis
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Generate coverage reports
      run: |
        # Frontend
        cd frontend && npm run test:coverage
        # Backend
        cd backend && go test ./... -coverprofile=coverage.out
    
    - name: Analyze coverage by category
      run: |
        python3 scripts/coverage_analyzer.py
    
    - name: Check critical thresholds
      run: |
        python3 scripts/coverage_enforcer.py --mode=strict
    
    - name: Generate coverage report
      if: always()
      run: |
        python3 scripts/coverage_report_generator.py
    
    - name: Upload coverage artifacts
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: coverage-report
        path: coverage-report.html
```

### Coverage Analyzer Script

```python
#!/usr/bin/env python3
# scripts/coverage_analyzer.py

import json
import re
from pathlib import Path

# File classification rules
CRITICAL_PATTERNS = [
    r'.*/model/.*\.ts$',          # Business logic models
    r'.*/lib/.*\.ts$',            # Utility functions
    r'.*/entity\.go$',            # Domain entities
    r'.*/valueobject\.go$',       # Value objects
    r'.*/service\.go$',           # Domain services
    r'.*/command/.*\.go$',        # Command handlers
    r'.*/query/.*\.go$',          # Query handlers
]

IMPORTANT_PATTERNS = [
    r'.*/handler\.go$',           # HTTP handlers
    r'.*/repository\.go$',        # Repository implementations
    r'.*/ui/.*\.svelte$',          # UI components
]

EXCLUDED_PATTERNS = [
    r'.*/types/.*\.ts$',          # Type definitions
    r'.*/routes/.*\.ts$',         # Route configurations
    r'.*/\.d\.ts$',               # TypeScript definitions
    r'.*/generated/.*',           # Auto-generated files
    r'.*/_test\.go$',             # Test files themselves
]

def classify_file(file_path):
    """Classify file based on path patterns"""
    for pattern in EXCLUDED_PATTERNS:
        if re.match(pattern, str(file_path)):
            return 'excluded'
    
    for pattern in CRITICAL_PATTERNS:
        if re.match(pattern, str(file_path)):
            return 'critical'
    
    for pattern in IMPORTANT_PATTERNS:
        if re.match(pattern, str(file_path)):
            return 'important'
    
    return 'other'

def analyze_coverage(coverage_file):
    """Analyze coverage report by file type"""
    # Parse coverage file
    # Classify each file
    # Calculate coverage by category
    # Return structured report
    pass

def main():
    coverage_data = analyze_coverage('coverage.out')
    
    print("Coverage Analysis Report:")
    print(f"Overall: {coverage_data['overall']}%")
    print(f"Critical: {coverage_data['critical']}% (target: 93%)")
    print(f"Important: {coverage_data['important']}% (target: 85%)")
    print(f"Excluded: {coverage_data['excluded']}% (not counted)")
    
    # Exit with error if critical threshold not met
    if coverage_data['critical'] < 93:
        print("FAIL: Critical coverage below 93%")
        exit(1)

if __name__ == '__main__':
    main()
```

## Decision Matrix

### Coverage Enforcement Rules

| Scenario | Overall | Critical | Decision | Rationale |
|----------|---------|----------|----------|-----------|
| Case 1 | 90% | 95% | ✅ PASS | All thresholds met |
| Case 2 | 86% | 80% | ❌ FAIL | Critical below 93% (regardless of overall) |
| Case 3 | 80% | 95% | ⚠️ WARN | Overall below baseline, but critical good |
| Case 4 | 70% | 70% | ❌ FAIL | Both below thresholds |
| Case 5 | 95% | 85% | ⚠️ WARN | Overall good, but critical below target |

### Enforcement Priority

```
1. CRITICAL thresholds (93%) → Block CI if not met
2. IMPORTANT thresholds (85%) → Warning only
3. OVERALL baseline (85%) → Warning only
```

## Implementation Examples

### Example 1: Scenario yang Anda Sebutkan

```yaml
coverage_report:
  overall: 86% ✅ (above 85% baseline)
  critical: 80% ❌ (below 93% target)
  important: 85% ✅ (meets target)
  excluded: 100% ✅ (not counted)

decision: FAIL ❌
reason: Business logic coverage below 93% threshold
action: Add tests for business logic files
```

### Example 2: Balanced Coverage

```yaml
coverage_report:
  overall: 87% ✅ (above 85% baseline)
  critical: 94% ✅ (above 93% target)
  important: 82% ⚠️ (below 85% target)
  excluded: 100% ✅ (not counted)

decision: PASS ✅ (with warnings)
reason: Critical thresholds met, overall baseline met
warnings: API handlers below 85% (consider adding tests)
```

### Example 3: High Critical, Low Overall

```yaml
coverage_report:
  overall: 82% ⚠️ (below 85% baseline)
  critical: 95% ✅ (above 93% target)
  important: 80% ⚠️ (below 85% target)
  excluded: 100% ✅ (not counted)

decision: PASS ✅ (with warnings)
reason: Critical business logic well-tested, overall below baseline
warnings: Overall coverage below 85%, add tests for non-critical files
```

## Benefits of Hierarchical Approach

### 1. True Risk Mitigation
- Focus on business logic that actually matters
- Reduce production bugs in critical code
- Better alignment with business objectives

### 2. Efficient Resource Allocation
- Time spent on testing high-value code
- Avoid wasting time on trivial code
- Better ROI on testing efforts

### 3. Honest Metrics
- Coverage numbers reflect actual quality
- No gaming the system
- Stakeholders get accurate picture

### 4. Developer Experience
- Clear priorities for testing
- Less confusion about what to test
- Better guidance for new developers

## Migration Strategy

### Phase 1: Current State (Overall Only)
```yaml
current_approach:
  target: 85% overall
  enforcement: block_if_below
  problem: Business logic can be under-tested
```

### Phase 2: Add Critical Thresholds (Recommended)
```yaml
improved_approach:
  overall_target: 85% (warn)
  critical_target: 93% (block)
  business_logic_focus: true
  benefit: Critical code must be well-tested
```

### Phase 3: Full Hierarchical Implementation
```yaml
final_approach:
  overall_target: 85% (warn)
  critical_target: 93% (block)
  important_target: 85% (warn)
  excluded_categories: implemented
  benefit: Complete coverage strategy
```

## Recommendation for This Project

### Immediate Implementation

```yaml
coverage_strategy:
  # Add to existing CI/CD
  coverage_analysis:
    overall_baseline: 85%  # Warning if below
    critical_threshold: 93%  # Block if below
    important_threshold: 85%  # Warning if below
    
  # File classification
  critical_files:
    - business_logic
    - services_use_cases
    - domain_entities
    - value_objects
    - utilities_helpers
  
  excluded_files:
    - type_definitions
    - error_pages
    - boilerplate_code
    - auto_generated
```

### CI/CD Update

```yaml
# Update existing coverage job
coverage-analysis:
  # Generate coverage report
  # Classify files by type
  # Check critical thresholds (BLOCK if below 93%)
  # Check overall baseline (WARN if below 85%)
  # Generate detailed report
```

## Conclusion

**To answer your question directly:**

**Q: "Overall sudah tercapai 86% tapi business logic 80%, apakah lolos atau gagal?"**

**A: HARUS GAGAL ❌**

**Rationale:**
- Business logic <93% violates critical threshold
- Overall >85% is just a baseline, not a substitute
- Risk of business logic bugs is unacceptable
- Aligns with global senior dev standards

**The approach ensures:**
1. Business quality over coverage numbers
2. True risk mitigation
3. Efficient resource allocation
4. Honest metrics

This hierarchical approach is more aligned with professional software engineering standards than overall-only coverage targets.