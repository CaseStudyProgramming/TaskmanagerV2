# API Contract Validation

This document describes how to validate the OpenAPI specification to ensure it complies with OpenAPI 3.1 standards and can be used by code generation tools like `oapi-codegen` and `orval`.

## Prerequisites

- Node.js v24.20.0 (required across development, testing, and production)

## Validation Tool

We use **Redocly CLI** for validating the OpenAPI specification against OpenAPI 3.1 standards.

## Running Validation

### Using npx (recommended)

```bash
npx @redocly/cli lint docs/api/openapi.yaml
```

This command:
- Downloads the latest Redocly CLI if not already installed
- Validates the OpenAPI specification against OpenAPI 3.1 standards
- Reports any errors or warnings
- Exit code 0 means validation passed, non-zero means validation failed

### Example Output

**Success:**
```
validating docs/api/openapi.yaml...
docs/api/openapi.yaml: validated in 196ms

Woohoo! Your API description is valid. 🎉
You have 1 warning.
```

**Failure:**
```
validating docs/api/openapi.yaml...
[1] docs/api/openapi.yaml:770:11 at #/components/schemas/StandardResponse/properties/data/nullable

Property `nullable` is not expected here.

❌ Validation failed with 8 errors and 2 warnings.
```

## When to Validate

Run validation after any changes to the API contract:

1. **Before committing changes** to `docs/api/openapi.yaml`
2. **After adding new endpoints** to the API
3. **After modifying existing schemas** or request/response structures
4. **Before running code generation** (oapi-codegen, orval)
5. **In CI/CD pipeline** to ensure API contract integrity

## OpenAPI 3.1 Specific Considerations

### Nullable Fields

In OpenAPI 3.1, the `nullable: true` property from OpenAPI 3.0 is replaced with type arrays that include `"null"`:

**OpenAPI 3.0 (NOT supported):**
```yaml
description:
  type: string
  nullable: true
```

**OpenAPI 3.1 (CORRECT):**
```yaml
description:
  type:
    - string
    - "null"
```

### Security Requirements

For endpoints that don't require authentication, explicitly set empty security:

```yaml
/auth/google:
  post:
    # ... endpoint definition
    security: []  # No authentication required
```

### Data Types

OpenAPI 3.1 uses JSON Schema Draft 2020-12 data types:
- `"null"` - explicitly null values
- `"boolean"` - true/false
- `"object"` - JSON objects
- `"array"` - JSON arrays
- `"number"` - numbers (including decimals)
- `"string"` - text strings
- `"integer"` - whole numbers

## Integration with Code Generation

### Before oapi-codegen

Always validate before generating Go code:

```bash
# Validate first
npx @redocly/cli lint docs/api/openapi.yaml

# Then generate code
oapi-codegen -package api -generate types,server,spec docs/api/openapi.yaml > internal/api/gen.go
```

### Before orval

Always validate before generating TypeScript/React Query code:

```bash
# Validate first
npx @redocly/cli lint docs/api/openapi.yaml

# Then generate code
orval --config orval.config.ts
```

## CI/CD Integration

Add validation to your CI/CD pipeline to catch API contract errors early:

```yaml
# Example for GitHub Actions
- name: Validate OpenAPI spec
  run: npx @redocly/cli lint docs/api/openapi.yaml
```

## Common Issues and Solutions

### Issue: "Property `nullable` is not expected here"

**Solution:** Replace `nullable: true` with type array `type: [string, "null"]`

### Issue: "Every operation should have security defined"

**Solution:** Add `security: []` for public endpoints or define security scheme

### Issue: "Component is never used"

**Solution:** Remove unused schema definitions or add references to them

### Issue: "Server url should not point to example.com or localhost"

**Solution:** This is a warning for production. Acceptable for development environments. This warning appears because:
- The spec includes `http://localhost:8080/api/v1` for local development
- The spec uses `example.com` domains for documentation purposes
- Code generation tools will still work correctly
- This warning can be safely ignored for development specs

## Additional Resources

- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0.html)
- [OpenAPI 3.0 to 3.1 Upgrade Guide](https://learn.openapis.org/upgrading/v3.0-to-v3.1.html)
- [Redocly CLI Documentation](https://redocly.com/docs/cli/)
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/release-notes)

## Project-Specific Notes

For this project (Task Manager API):
- API version: 1.0.0
- OpenAPI version: 3.1.0
- Base path: `/api/v1`
- Authentication: Bearer JWT (from Google OAuth)
- Main endpoints: Authentication, Tasks, Export/Import, Offline Sync

The current OpenAPI spec is located at: `docs/api/openapi.yaml`
