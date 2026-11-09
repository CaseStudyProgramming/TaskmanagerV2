# API Specifications

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Active
**Source of Truth**: openapi.yaml

---

## Purpose

This document defines the mandatory rules, policies, and technical specifications that all developers MUST follow when designing, implementing, or modifying APIs in this project. It serves as the single source of truth derived from the OpenAPI specification.

**Violation of these guidelines is considered a code review blocker.**

---

## Response Format Standards

### Standard Response Structure

All API responses MUST follow the `StandardResponse` schema defined in `components/schemas/StandardResponse`.

**Required Fields:**
- `status.code` - HTTP status code (integer)
- `status.message` - Human-readable message (string)
- `status.is_success` - Boolean indicating success/failure
- `meta.timestamp` - Request completion time in epoch milliseconds (int64)
- `meta.request_id` - Unique UUID for request tracking

**Optional Fields:**
- `data` - Response payload (object, array, or null)
- `meta.trace_id` - Distributed trace ID for debugging (string)
- `meta.pagination` - Pagination metadata (object)
- `meta.errors` - Error details array (error responses only)
- `meta.rate_limit` - Rate limit metadata (429 responses only)

### Response Components

#### Status Object (Required)

Contains the HTTP status information:
- `code` (integer): HTTP status code
- `message` (string): Human-readable message
- `is_success` (boolean): Boolean indicating success/failure

#### Data Object (Required for success responses)

Contains the actual response data:
- Can be an object, array, or null
- Structure varies by endpoint
- For error responses, this is set to `null`

#### Meta Object (Required)

Contains metadata about the response:
- `timestamp` (integer): Request completion time in epoch milliseconds
- `request_id` (string): Unique identifier for request tracking (UUID)
- `pagination` (object): Included for list responses (optional)
- `errors` (array): Error details for error responses (optional)

#### Pagination Object (Optional for list responses)

Included in list endpoints:
- `page` (integer): Current page number
- `limit` (integer): Items per page
- `total` (integer): Total number of items
- `total_pages` (integer): Total number of pages

#### Error Details Array (Optional for error responses)

Included in error responses:
- `field` (string): Field that caused the error
- `message` (string): Error message

### Success Response Requirements

- `data` field MUST be populated with response payload
- `status.is_success` MUST be `true`
- `status.code` MUST match HTTP status code (200, 201, etc.)

### Error Response Requirements

- `data` field MUST be `null`
- `status.is_success` MUST be `false`
- `meta.errors` array MUST be populated
- Each error item MUST follow `ErrorDetail` schema

### Pagination Requirements

When returning paginated data:
- `meta.pagination` object MUST be included
- MUST contain: `page`, `limit`, `total`, `total_pages`
- Default page: 1
- Default limit: 20
- Maximum limit: 100

### Time Format

All timestamps are represented as **epoch milliseconds** (Unix time in milliseconds).

### Request ID

Each response includes a unique `request_id` (UUID) for request tracking, log correlation, support ticket reference, and distributed tracing.

### Schema Reference

**Success Schema:** `components/schemas/StandardResponse`
**Error Detail Schema:** `components/schemas/ErrorDetail`

---

## Error Handling Standards

### Error Detail Schema

All error details MUST use the `ErrorDetail` schema with these fields:

**Required Fields:**
- `code` - Standardized error code (enum validated)
- `field` - Field name that caused error (string or null)
- `message` - Human-readable error message (string)

**Optional Fields:**
- `context` - Additional debugging context (object)
- `nested_errors` - Nested error details for complex validation (array)

### Error Code Validation

The `code` field MUST be one of the validated error codes defined in `components/schemas/ErrorDetail.code` enum. Custom error codes are NOT allowed.

### Error Context Guidelines

The `context` field in `ErrorDetail` provides additional debugging information.

**Must Include:**
- Validation failures (expected vs received)
- Authorization failures (resource ownership details)
- Resource conflicts (existing resource info)
- Rate limiting (limit details)
- External service errors (service name, timeout)

**Must Not Include:**
- Generic server errors (SRV_001)
- Security-sensitive information
- Stack traces or internal implementation details

**Format Guidelines:**
- Use snake_case for keys
- Keep values simple (strings, numbers, booleans)
- Avoid nested objects beyond 2 levels
- Keep total context size under 1KB

### Error Hierarchy (nested_errors)

The `nested_errors` field allows complex validation errors to be represented hierarchically.

**Use When:**
- Array validation errors (bulk operations)
- Nested object validation
- Multiple field validation errors
- Batch operation errors

**Depth Limit:**
- Maximum 3 levels of nesting
- Each level should have clear parent-child relationship
- Avoid circular references

**Field Naming:**
- Use array notation for array indices: `items[0]`, `tasks[2]`
- Use dot notation for nested objects: `user.profile.email`
- Be consistent with field naming

### Trace ID

The `trace_id` field in `ResponseMeta` enables distributed tracing across microservices.

**Format:**
- Recommended: 32-character hexadecimal string (AWS X-Ray style)
- Alternatives: UUID, ULID, W3C Trace Context

**Implementation Requirements:**
- Generate at ingress
- Propagate to all downstream services
- Include in all log entries
- Return in all error responses

**Best Practices:**
- Always include in error responses
- Propagate across service boundaries
- Use in monitoring dashboards
- Link to support tickets
- Don't expose in public documentation
- Use cryptographically random generation

### Global Error Responses

All endpoints MUST use global error response references defined in `components/responses`:
- `BadRequest` (400)
- `Unauthorized` (401)
- `Forbidden` (403)
- `NotFound` (404)
- `Conflict` (409)
- `UnprocessableEntity` (422)
- `RateLimitExceeded` (429)
- `InternalServerError` (500)
- `ServiceUnavailable` (503)

DO NOT define inline error responses. Use `$ref` to global responses.

### Custom Error Responses

If endpoint-specific error context is needed:
- Create custom error response in `components/responses`
- MUST extend `StandardResponse` schema
- MUST include error code in `meta.errors`
- MUST include `trace_id` in `meta`

---

## Error Code Usage

### Error Code Categories

Error codes are organized by category in `components/x-error-codes`:
- `authentication` - AUTH_001 to AUTH_006
- `authorization` - AUTHZ_001 to AUTHZ_003
- `validation` - VAL_001 to VAL_009
- `resource` - RES_001 to RES_004
- `database` - DB_001 to DB_004
- `external_service` - EXT_001 to EXT_003
- `rate_limiting` - RATE_001 to RATE_002
- `server` - SRV_001 to SRV_003

### HTTP Status Codes

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| `200` | OK | Successful request |
| `201` | Created | Resource created successfully |
| `204` | No Content | Successful request with no response body |
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Authentication required or failed |
| `403` | Forbidden | User lacks permission |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource conflict (duplicate, etc.) |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Service temporarily unavailable |

### Error Codes Reference

**Source:** `components/x-error-codes` in openapi.yaml

#### Authentication Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `AUTH_001` | 401 | Invalid credentials | Invalid username or password |
| `AUTH_002` | 401 | Token expired | Access token has expired |
| `AUTH_003` | 401 | Token invalid | Invalid or malformed token |
| `AUTH_004` | 401 | Token revoked | Token has been revoked |
| `AUTH_005` | 401 | Session expired | User session has expired |
| `AUTH_006` | 401 | Not authenticated | Authentication required |

#### Authorization Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `AUTHZ_001` | 403 | Forbidden | User lacks permission to access resource |
| `AUTHZ_002` | 403 | Insufficient permissions | User has insufficient permissions |
| `AUTHZ_003` | 403 | Resource ownership | User does not own the resource |

#### Validation Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `VAL_001` | 400 | Required field missing | Required field is missing |
| `VAL_002` | 400 | Invalid format | Field format is invalid |
| `VAL_003` | 400 | Invalid value | Field value is invalid |
| `VAL_004` | 400 | Value too short | Field value is too short |
| `VAL_005` | 400 | Value too long | Field value is too long |
| `VAL_006` | 400 | Invalid email | Email format is invalid |
| `VAL_007` | 400 | Invalid UUID | UUID format is invalid |
| `VAL_008` | 400 | Invalid date | Date format is invalid |
| `VAL_009` | 400 | Invalid enum | Invalid enum value |

#### Resource Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `RES_001` | 404 | Resource not found | Resource does not exist |
| `RES_002` | 409 | Resource already exists | Resource already exists |
| `RES_003` | 409 | Resource conflict | Resource conflict detected |
| `RES_004` | 409 | Duplicate entry | Duplicate entry detected |

#### Database Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `DB_001` | 500 | Database connection failed | Failed to connect to database |
| `DB_002` | 500 | Database query failed | Database query execution failed |
| `DB_003` | 500 | Database transaction failed | Database transaction failed |
| `DB_004` | 500 | Database constraint violation | Database constraint violation |

#### External Service Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `EXT_001` | 502 | External service unavailable | External service is unavailable |
| `EXT_002` | 504 | External service timeout | External service request timed out |
| `EXT_003` | 502 | External service error | External service returned an error |

#### Rate Limiting Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `RATE_001` | 429 | Rate limit exceeded | Request rate limit exceeded |
| `RATE_002` | 429 | Too many requests | Too many requests in time window |

#### Server Errors

| Error Code | HTTP Status | Message | Description |
|------------|-------------|---------|-------------|
| `SRV_001` | 500 | Internal server error | Internal server error |
| `SRV_002` | 503 | Service unavailable | Service temporarily unavailable |
| `SRV_003` | 500 | Configuration error | Server configuration error |

### Endpoint Error Code Documentation

Every endpoint MUST document its possible error codes using the `x-error-codes` extension.

**Requirements:**
- MUST include all possible error codes
- MUST include validation errors (VAL_*)
- MUST include authentication errors (AUTH_006 for protected endpoints)
- MUST include database errors if applicable
- MUST include server errors (SRV_001)

DO NOT add error codes that cannot occur for that endpoint.

---

## Error Rate Tracking

### Configuration

Error rate tracking is configured in `components/x-error-tracking`:
- Alert thresholds (critical, warning)
- Monitored error codes (critical, warning)
- Alert channels (slack, email, pagerduty)

### Critical Error Codes

These trigger immediate alerts:
- DB_001 (Database connection failed)
- DB_002 (Database query failed)
- SRV_001 (Internal server error)
- EXT_001 (External service unavailable)

### Warning Error Codes

These trigger hourly digests:
- AUTH_002 (Token expired)
- RATE_001 (Rate limit exceeded)
- RES_003 (Resource conflict)

### Monitoring Requirements

Backend MUST:
- Track error counts per code
- Check thresholds every 5 minutes
- Send alerts when thresholds exceeded
- Log all critical errors

---

## Error Code Migration

### Stability Guarantee

Error codes MUST be stable across API versions. Do NOT change error code semantics.

### Deprecating an Error Code

When deprecating an error code:
1. Add `deprecated: true` annotation in OpenAPI
2. Keep deprecated code for at least 2 major versions
3. Add migration helper with `x-migration-hint` extension
4. Document migration in openapi.yaml
5. Communicate to API consumers 6 months in advance

### Adding a New Error Code

When adding a new error code:
1. Add to appropriate category in `components/x-error-codes`
2. Add to `ErrorDetail.code` enum
3. Add to affected endpoints' `x-error-codes`
4. Update client SDKs to handle new code
5. Add to error tracking configuration if critical

### Migration Helpers

Migration helpers guide API consumers through breaking changes in error codes.

**OpenAPI Extension:**
Use `x-migration-hints` extension in openapi.yaml.

**Current Migrations:**
*(No active migrations - see openapi.yaml for current migration hints)*

---

## Endpoint Documentation

### Operation Documentation

Every endpoint MUST have:
- `summary` - Short, descriptive title (1-2 sentences)
- `description` - Detailed explanation (when applicable)
- `operationId` - Unique identifier for code generation
- `tags` - At least one tag for grouping

### Parameter Documentation

Every parameter MUST have:
- `name` - Parameter name
- `in` - Location (path, query, header, cookie)
- `description` - Clear explanation of purpose
- `schema` - Type and validation rules
- `required` - Boolean (true if required)

### Request Body Documentation

Every request body MUST have:
- `required` - Boolean
- `content` - Media type (application/json, multipart/form-data, etc.)
- `schema` - Request schema reference or inline definition

### Response Documentation

Every response MUST have:
- `description` - Explanation of response
- `content` - Media type and schema

For successful responses:
- MUST include example payload
- MUST use `$ref` to response schema

For error responses:
- MUST use `$ref` to global error response
- DO NOT define inline error responses

### Examples

All examples MUST:
- Use realistic data
- Follow the schema exactly
- Include all required fields
- Use valid UUIDs where applicable
- Use current or future timestamps (epoch milliseconds)

---

## Security Standards

### Authentication

All protected endpoints MUST:
- Use `BearerAuth` security scheme
- Include `security: - BearerAuth: []`
- Return 401 with AUTH_006 if authentication fails

### Public Endpoints

Public endpoints MUST:
- Include `security: []` to explicitly mark as public
- Document authentication requirements in description

### Sensitive Data

DO NOT include in responses:
- Passwords
- API keys
- Secrets
- Full personal identifiers (use partial/redacted)

DO include in error context:
- Resource types (not IDs for sensitive resources)
- Field names (not values for sensitive fields)

---

## Versioning and Migration

### API Versioning Strategy

**URL-Based Versioning:**
API version MUST be in the URL path:
```
/api/v1/tasks
/api/v2/tasks
```

**Version Semantics:**
- Use semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Breaking changes
- MINOR: Non-breaking additions
- PATCH: Bug fixes

**OpenAPI Versioning:**
- OpenAPI `info.version` MUST match the API version
- Each API version has its own OpenAPI file
- File naming: `openapi-v1.yaml`, `openapi-v2.yaml`

**Version Support Policy:**
- Support latest 2 major versions concurrently
- Deprecate older versions with 6-month notice
- Deprecation notice MUST be in response headers:
  ```
  X-API-Deprecated: true
  X-API-Sunset: 2027-05-09
  X-API-Replacement: /api/v2/...
  ```

### Breaking Changes Classification

**Breaking Changes (MAJOR version increment):**
- Removing an endpoint
- Changing endpoint path
- Changing HTTP method
- Removing required request fields
- Adding required request fields
- Changing response structure
- Removing response fields
- Changing field types
- Removing error codes
- Changing error code semantics
- Changing authentication requirements

**Non-Breaking Changes (MINOR version increment):**
- Adding optional request fields
- Adding optional response fields
- Adding new endpoints
- Adding new error codes
- Adding new query parameters with defaults
- Adding new headers
- Expanding enum values

**Bug Fixes (PATCH version increment):**
- Fixing typos in descriptions
- Fixing validation logic without changing behavior
- Fixing performance issues without changing interface
- Documentation corrections

### Breaking Change Process

**Before Making Breaking Change:**

1. **Impact Analysis:**
   - Identify all affected endpoints
   - Identify all affected error codes
   - Estimate migration effort for consumers
   - Identify high-impact consumers

2. **Migration Planning:**
   - Design migration path
   - Create migration helper (`x-migration-hints`)
   - Write migration guide
   - Plan deprecation timeline

3. **Implementation:**
   - Implement new version alongside old version
   - Add migration layer for backwards compatibility
   - Update OpenAPI specification
   - Add deprecation headers to old version

4. **Communication:**
   - Announce breaking change 6 months in advance
   - Send notification to all API consumers
   - Publish migration guide
   - Provide SDK updates
   - Offer migration support

5. **Deprecation:**
   - Add deprecation notice to old version
   - Set sunset date
   - Monitor usage of old version
   - Send reminders before sunset

6. **Sunset:**
   - Shut down old version on announced date
   - Remove migration layer
   - Archive old documentation

**Checklist:**
- [ ] Impact analysis completed
- [ ] Migration helper added to OpenAPI
- [ ] Migration guide published
- [ ] 6-month notice sent to consumers
- [ ] SDK updated and released
- [ ] Old version marked as deprecated
- [ ] Sunset date set
- [ ] Monitoring in place for old version
- [ ] Reminder sent 1 month before sunset
- [ ] Old version shut down on sunset date

---

## Performance Standards

### Response Time Targets

- GET requests: < 200ms (p95)
- POST requests: < 500ms (p95)
- PUT requests: < 500ms (p95)
- DELETE requests: < 200ms (p95)

### Pagination Limits

Maximum limit per page: 100 items
Default limit per page: 20 items

### Rate Limiting

Default rate limit: 100 requests per minute per user

Rate limit response MUST include:
- `meta.rate_limit.limit` - Total limit
- `meta.rate_limit.remaining` - Remaining requests
- `meta.rate_limit.reset` - Reset timestamp (epoch milliseconds)

### Distributed Tracing

All responses MUST include `meta.trace_id` for debugging.

Trace ID MUST:
- Be generated at ingress
- Be propagated to all downstream services
- Be included in all log entries
- Be returned in all error responses

---

## API Contract Validation

This section describes how to validate the OpenAPI specification to ensure it complies with OpenAPI 3.1 standards and can be used by code generation tools.

### Validation Tool

We use **Redocly CLI** for validating the OpenAPI specification against OpenAPI 3.1 standards.

### Running Validation

Using npx:
```bash
npx @redocly/cli lint docs/tdd/api/openapi.yaml
```

This command:
- Downloads the latest Redocly CLI if not already installed
- Validates the OpenAPI specification against OpenAPI 3.1 standards
- Reports any errors or warnings
- Exit code 0 means validation passed, non-zero means validation failed

### When to Validate

Run validation after any changes to the API contract:
1. Before committing changes to `docs/tdd/api/openapi.yaml`
2. After adding new endpoints to the API
3. After modifying existing schemas or request/response structures
4. Before running code generation (oapi-codegen, orval)
5. In CI/CD pipeline to ensure API contract integrity

### OpenAPI 3.1 Specific Considerations

#### Nullable Fields

In OpenAPI 3.1, the `nullable: true` property from OpenAPI 3.0 is replaced with type arrays that include `"null"`.

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

#### Security Requirements

For endpoints that don't require authentication, explicitly set empty security:
```yaml
/auth/google:
  post:
    security: []  # No authentication required
```

#### Data Types

OpenAPI 3.1 uses JSON Schema Draft 2020-12 data types:
- `"null"` - explicitly null values
- `"boolean"` - true/false
- `"object"` - JSON objects
- `"array"` - JSON arrays
- `"number"` - numbers (including decimals)
- `"string"` - text strings
- `"integer"` - whole numbers

### Integration with Code Generation

Always validate before generating code with oapi-codegen or orval.

### CI/CD Integration

Add validation to your CI/CD pipeline to catch API contract errors early.

### Common Issues and Solutions

**Issue:** "Property `nullable` is not expected here"
**Solution:** Replace `nullable: true` with type array `type: [string, "null"]`

**Issue:** "Every operation should have security defined"
**Solution:** Add `security: []` for public endpoints or define security scheme

**Issue:** "Component is never used"
**Solution:** Remove unused schema definitions or add references to them

**Issue:** "Server url should not point to example.com or localhost"
**Solution:** This is a warning for production. Acceptable for development environments. This warning appears because the spec includes `http://localhost:8080/api/v1` for local development. This warning can be safely ignored for development specs.

---

## Code Review Checklist

Before approving any API changes, reviewers MUST verify:

- [ ] Response follows `StandardResponse` schema
- [ ] Error codes are from validated enum
- [ ] Error responses use global `$ref`
- [ ] Endpoint has `x-error-codes` documentation
- [ ] All required fields are documented
- [ ] Examples are realistic and valid
- [ ] Sensitive data is not exposed
- [ ] Trace ID is included in responses
- [ ] Breaking changes are documented
- [ ] Rate limiting is configured if applicable
- [ ] Pagination limits are enforced
- [ ] Security scheme is correctly applied

---

## Enforcement

### Automated Validation

OpenAPI spec MUST be validated in CI/CD pipeline:
- Spectral linting for style guide compliance
- Schema validation for type safety
- Enum validation for error codes
- Reference validation for `$ref` integrity

### Manual Review

Code reviewers MUST:
- Reject changes violating these guidelines
- Request updates for incomplete documentation
- Verify all checklist items before approval

### Documentation Updates

When adding or modifying APIs:
1. Update openapi.yaml first
2. Update this document if guidelines change
3. Run OpenAPI generator to update derived docs
4. Ensure all documentation is consistent

---

## Client SDK Guidelines

### Error Code Grouping

When generating client SDKs, error codes MUST be grouped by category into typed exception classes.

**Grouping Structure:**
- `ValidationError` - VAL_001 to VAL_009
- `AuthenticationError` - AUTH_001 to AUTH_006
- `AuthorizationError` - AUTHZ_001 to AUTHZ_003
- `ResourceError` - RES_001 to RES_004
- `DatabaseError` - DB_001 to DB_004
- `ExternalServiceError` - EXT_001 to EXT_003
- `RateLimitError` - RATE_001 to RATE_002
- `ServerError` - SRV_001 to SRV_003

### SDK Implementation Requirements

**For Each Exception Class:**
- MUST include the specific error code (typed enum)
- MUST include error message from API response
- MUST include error context (if present in response)
- MUST include error field (if present in response)
- MUST support catching by category or specific code
- MUST extend base API Error class

### SDK Generation

**OpenAPI Generator Configuration:**
Use custom templates for error handling to automatically generate typed exceptions.

---

## Project-Specific Notes

For this project (Task Manager API):
- API version: 1.0.0
- OpenAPI version: 3.1.0
- Base path: `/api/v1`
- Authentication: Bearer JWT (from Google OAuth)
- Main endpoints: Authentication, Tasks, Export/Import, Offline Sync

The current OpenAPI spec is located at: `docs/tdd/api/openapi.yaml`

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-11-09 | 1.0 | Initial version - API specifications consolidated |

---

## References

- [OpenAPI Specification](./openapi.yaml) - Single source of truth for API contract
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0.html)
- [OpenAPI 3.0 to 3.1 Upgrade Guide](https://learn.openapis.org/upgrading/v3.0-to-v3.1.html)
- [Redocly CLI Documentation](https://redocly.com/docs/cli/)
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/release-notes)
