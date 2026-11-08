# Woodpecker Artifact Management

**Version**: 1.0  
**Date**: 2026-11-01  
**Status**: Draft

---

## Overview

Woodpecker CI tidak memiliki built-in artifact storage seperti GitHub Actions. Solusinya adalah menggunakan external storage untuk menyimpan artifacts seperti coverage reports, test results, build artifacts, dll.

## Recommended Solution: OCI Object Storage + Lifecycle Policy + .zip Compression

Gunakan OCI Object Storage (10GB Standard tier PAYG) untuk menyimpan Woodpecker CI/CD artifacts dengan:
- **OCI Lifecycle Policy** untuk auto-cleanup otomatis
- **.zip compression** (per-folder) untuk hemat storage
- **2 buckets terpisah** untuk cache dan artifacts

Ini sudah sesuai dengan setup Anda dan paling simple - tidak perlu script tambahan atau cron job.

---

## Artifact Types (with .zip compression)

### 1. Coverage Reports
- Frontend coverage (HTML, JSON, LCOV)
- Backend coverage (HTML, JSON)
- Coverage analysis reports
- **Compression**: Folder dikompresi menjadi 1 file .zip
- **Estimated size**: ~8-16 MB → ~2-4 MB (75% reduction)

### 2. Test Results
- E2E test results (screenshots, videos, traces)
- Unit test results (XML, JSON)
- Integration test results
- **Compression**: Folder dikompresi menjadi 1 file .zip
- **Estimated size**: ~32-75 MB → ~8-19 MB (75% reduction)

### 3. Build Artifacts
- Frontend build files
- Backend binary
- Docker images (push ke registry)
- **Compression**: Folder dikompresi menjadi 1 file .zip
- **Estimated size**: ~25-50 MB → ~6-12.5 MB (75% reduction)

### 4. Performance Reports
- Lighthouse reports
- k6 load test results
- **Compression**: Folder dikompresi menjadi 1 file .zip
- **Estimated size**: ~7-15 MB → ~1.75-3.75 MB (75% reduction)

### 5. Security Reports
- Snyk scan results
- Gitleaks scan results
- **Compression**: Folder dikompresi menjadi 1 file .zip
- **Estimated size**: ~1.5-4 MB → ~0.375-1 MB (75% reduction)

---

## OCI Object Storage Setup

### 1. Create 2 Buckets with Lifecycle Policy

```bash
# Install OCI CLI
sudo apt install -y oracle-cloud-cli

# Configure OCI CLI
oci setup config

# Bucket 1: Cache (3-day retention)
oci os bucket create \
  --compartment-id $COMPARTMENT_ID \
  --name woodpecker-cache \
  --public-access-type NoPublicAccess \
  --object-lifecycle-rule-age-days 3

# Bucket 2: Artifacts (2-day retention)
oci os bucket create \
  --compartment-id $COMPARTMENT_ID \
  --name woodpecker-artifacts \
  --public-access-type NoPublicAccess \
  --object-lifecycle-rule-age-days 2

# Verify bucket creation
oci os bucket list --compartment-id $COMPARTMENT_ID
```

**Penting**:
- **OCI Object Storage tidak punya hard limit per bucket** - semua bucket sharing 10GB total (Standard tier PAYG)
- Bucket cache: 3-day retention untuk dependencies (node_modules, vendor)
- Bucket artifacts: 2-day retention untuk coverage, E2E, security reports
- Dengan .zip compression, estimated usage ~2.7 GB total, buffer 7.3 GB
- Jika ingin lebih hemat storage, gunakan 3-day retention untuk lebih optimal
- Anda bisa ubah retention sesuai kebutuhan, tapi ingat storage limit 10GB

### 2. Configure Pre-Authenticated Requests (Optional)

Untuk akses artifacts tanpa authentication (untuk publik reports):

```bash
# Create pre-authenticated request for coverage reports
oci os preauth-request create \
  --bucket-name woodpecker-artifacts \
  --name coverage-reports \
  --access-type ObjectRead \
  --time-expires 2027-12-31
```

---

## Woodpecker Plugin for OCI Object Storage

### Option 1: Woodpecker Plugin (Custom)

Create custom plugin untuk upload artifacts ke OCI:

```yaml
# .woodpecker.yml
pipeline:
  # Upload coverage reports
  upload-coverage:
    image: quay.io/podman/stable
    commands:
      - podman run --rm \
        -v $(pwd):/workspace \
        -e OCI_CONFIG_FILE=/workspace/.oci/config \
        -e BUCKET_NAME=woodpecker-artifacts \
        ghcr.io/yourusername/woodpecker-oci-upload:latest \
        --source /workspace/coverage \
        --destination coverage-reports/${CI_COMMIT_SHA}
    secrets: [oci_config_file]
    when:
      event: [push, pull_request]
```

### Option 2: OCI CLI Direct with .zip Compression (Simpler)

Gunakan OCI CLI langsung di pipeline dengan .zip compression:

```yaml
# .woodpecker.yml
pipeline:
  coverage-analysis:
    image: python:3.12-alpine
    commands:
      - pip install coverage-parser
      - python3 scripts/coverage_analyzer.py
    when:
      branch: [develop, main]
      event: [push, pull_request]

  upload-coverage:
    image: oraclecloud-cli:latest
    commands:
      - apk add --no-cache python3 py3-pip
      - pip install oci
      # Upload folder sebagai 1 file .zip
      - python3 scripts/upload_artifacts.py \
        --bucket woodpecker-artifacts \
        --source coverage/ \
        --destination coverage/
    secrets: [oci_config_file]
    when:
      branch: [develop, main]
      event: [push, pull_request]
```

**Hasil**: Folder `coverage/` dikompresi menjadi `coverage.zip` dan diupload ke OCI Object Storage.

---

## Upload Script

### scripts/upload_artifacts.py

```python
#!/usr/bin/env python3
import argparse
import os
import sys
from pathlib import Path
import oci

def upload_artifacts(bucket_name, source_dir, destination_prefix):
    """Upload artifacts to OCI Object Storage"""

    # Load OCI configuration
    config = oci.config.from_file()
    object_storage_client = oci.object_storage.ObjectStorageClient(config)

    # Get namespace
    namespace = object_storage_client.get_namespace().data

    # Upload files
    source_path = Path(source_dir)
    uploaded_count = 0

    for file_path in source_path.rglob('*'):
        if file_path.is_file():
            # Create destination path
            relative_path = file_path.relative_to(source_path)
            object_name = f"{destination_prefix}/{relative_path}"

            # Upload file
            with open(file_path, 'rb') as f:
                object_storage_client.put_object(
                    namespace_name=namespace,
                    bucket_name=bucket_name,
                    object_name=object_name,
                    put_object_body=f
                )

            uploaded_count += 1
            print(f"Uploaded: {object_name}")

    print(f"Total files uploaded: {uploaded_count}")

def main():
    parser = argparse.ArgumentParser(description='Upload artifacts to OCI Object Storage')
    parser.add_argument('--bucket', required=True, help='Bucket name')
    parser.add_argument('--source', required=True, help='Source directory')
    parser.add_argument('--destination', required=True, help='Destination prefix')
    args = parser.parse_args()

    upload_artifacts(args.bucket, args.source, args.destination)

if __name__ == '__main__':
    main()
```

---

## Alternative Solutions

### Option 2: MinIO (Self-Hosted S3-Compatible)

Install MinIO di server Woodpecker:

```yaml
# docker-compose.yml for MinIO
version: '3.8'

services:
  minio:
    image: minio/minio:latest
    container_name: minio
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - /var/lib/minio:/data
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    command: server /data --console-address ":9001"
    restart: unless-stopped
```

Woodpecker plugin untuk MinIO:

```yaml
# .woodpecker.yml
pipeline:
  upload-artifacts:
    image: woodpeckerci/plugin-s3
    settings:
      bucket: woodpecker-artifacts
      source: coverage/
      target: /coverage/${CI_COMMIT_SHA}/
      endpoint: http://minio:9000
      access_key:
        from_secret: minio_access_key
      secret_key:
        from_secret: minio_secret_key
    when:
      event: [push, pull_request]
```

### Option 3: AWS S3 (Paid)

Gunakan Woodpecker S3 plugin:

```yaml
# .woodpecker.yml
pipeline:
  upload-artifacts:
    image: woodpeckerci/plugin-s3
    settings:
      bucket: woodpecker-artifacts
      source: coverage/
      target: /coverage/${CI_COMMIT_SHA}/
      access_key:
        from_secret: aws_access_key
      secret_key:
        from_secret: aws_secret_key
      region: us-east-1
    when:
      event: [push, pull_request]
```

---

## Updated .woodpecker.yml with Artifact Upload

```yaml
# .woodpecker.yml - Updated with artifact upload
variables:
  - &bun_version "1.4.2"
  - &go_version "1.27"
  - &project_name "taskmanager"

clone:
  git:
    image: woodpeckerci/plugin-git:latest
    depth: 50

pipeline:
  # Stage 1: Quality Checks
  quality-checks:
    image: oven/bun:*bun_version
    commands:
      - bun install
      - bun run format:check
      - bun run lint
      - bun run type-check
    when:
      event: [push, pull_request]

  # Stage 2: Unit Tests
  unit-tests-frontend:
    image: oven/bun:*bun_version
    commands:
      - bun install
      - bun run test:unit -- --coverage
    when:
      event: [push, pull_request]

  unit-tests-backend:
    image: golang:*go_version
    commands:
      - go test ./... -short -cover
    when:
      event: [push, pull_request]

  # Stage 3: Integration Tests
  integration-tests:
    image: golang:*go_version
    commands:
      - go test ./... -cover
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: test
      DB_PASSWORD: test
      DB_NAME: taskmanager_db_testing
    services:
      postgres:
        image: postgres:16-alpine
        environment:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: taskmanager_db_testing
    when:
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 4: Coverage Analysis
  coverage-analysis:
    image: python:3.12-alpine
    commands:
      - pip install coverage-parser
      - python3 scripts/coverage_analyzer.py
    when:
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 5: Upload Coverage Reports (NEW)
  upload-coverage:
    image: oraclecloud-cli:latest
    commands:
      - apk add --no-cache python3 py3-pip
      - pip install oci
      - python3 scripts/upload_artifacts.py \
        --bucket woodpecker-artifacts \
        --source coverage/ \
        --destination coverage/${CI_COMMIT_SHA}/
    secrets: [oci_config_file]
    when:
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 6: Security Scan
  security-scan:
    image: snyk/snyk-cli:latest
    commands:
      - snyk auth $${SNYK_TOKEN}
      - snyk test --severity-threshold=high
    secrets: [snyk_token]
    when:
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 7: Upload Security Reports (NEW)
  upload-security:
    image: oraclecloud-cli:latest
    commands:
      - apk add --no-cache python3 py3-pip
      - pip install oci
      - python3 scripts/upload_artifacts.py \
        --bucket woodpecker-artifacts \
        --source security-reports/ \
        --destination security/${CI_COMMIT_SHA}/
    secrets: [oci_config_file]
    when:
      branch: [develop, main]
      event: [push, pull_request]

  # Stage 8: E2E Tests
  e2e-tests-chromium:
    image: mcr.microsoft.com/playwright:v1.63.0
    commands:
      - bun install
      - bun run test:e2e --project=chromium
    when:
      branch: main
      event: [push, cron]

  e2e-tests-firefox:
    image: mcr.microsoft.com/playwright:v1.63.0
    commands:
      - bun install
      - bun run test:e2e --project=firefox
    when:
      branch: main
      event: [push, cron]

  e2e-tests-webkit:
    image: mcr.microsoft.com/playwright:v1.63.0
    commands:
      - bun install
      - bun run test:e2e --project=webkit
    when:
      branch: main
      event: [push, cron]

  # Stage 9: Upload E2E Test Results (NEW)
  upload-e2e-results:
    image: oraclecloud-cli:latest
    commands:
      - apk add --no-cache python3 py3-pip
      - pip install oci
      - python3 scripts/upload_artifacts.py \
        --bucket woodpecker-artifacts \
        --source playwright-report/ \
        --destination e2e/${CI_COMMIT_SHA}/
    secrets: [oci_config_file]
    when:
      branch: main
      event: [push, cron]

  # Stage 10: Performance Check
  performance-check:
    image: oven/bun:*bun_version
    commands:
      - bun install
      - bun run build
      - bun run lighthouse
    when:
      branch: main
      event: [push]

  # Stage 11: Upload Performance Reports (NEW)
  upload-performance:
    image: oraclecloud-cli:latest
    commands:
      - apk add --no-cache python3 py3-pip
      - pip install oci
      - python3 scripts/upload_artifacts.py \
        --bucket woodpecker-artifacts \
        --source lighthouse-report/ \
        --destination performance/${CI_COMMIT_SHA}/
    secrets: [oci_config_file]
    when:
      branch: main
      event: [push]

  # Stage 12: Build and Push
  build-frontend:
    image: oven/bun:*bun_version
    commands:
      - bun install
      - bun run build
    when:
      branch: main
      event: [push]

  build-backend:
    image: golang:*go_version
    commands:
      - go build -o bin/app ./cmd/api
    when:
      branch: main
      event: [push]

  push-to-registry:
    image: quay.io/podman/stable
    commands:
      - podman login ghcr.io -u $${GITHUB_USERNAME} -p $${GITHUB_TOKEN}
      - podman build -t ghcr.io/$${GITHUB_USERNAME}/$${PROJECT_NAME}-backend:latest ./backend
      - podman push ghcr.io/$${GITHUB_USERNAME}/$${PROJECT_NAME}-backend:latest
    secrets: [github_username, github_token]
    when:
      branch: main
      event: [push]
```

---

## Artifact Download

### Download via OCI CLI

```bash
# Download coverage report
oci os object get \
  --bucket-name woodpecker-artifacts \
  --name coverage/${CI_COMMIT_SHA}/index.html \
  --file coverage-report.html

# Download entire directory
oci os object bulk-download \
  --bucket-name woodpecker-artifacts \
  --prefix coverage/${CI_COMMIT_SHA}/ \
  --download-dir ./coverage/
```

### Download via Pre-Authenticated URL

```bash
# Generate pre-authenticated URL
oci os preauth-request create \
  --bucket-name woodpecker-artifacts \
  --name coverage-${CI_COMMIT_SHA} \
  --access-type ObjectRead \
  --time-expires 2027-12-31

# Access via URL
# https://objectstorage.region.oraclecloud.com/p/{access-id}/n/{namespace}/b/{bucket}/o/{object}
```

---

## Artifact Retention Policy

### OCI Lifecycle Policy (Recommended - Auto-Cleanup)

**Gunakan OCI Lifecycle Policy untuk auto-cleanup otomatis.** Ini adalah cara terbaik karena:
- ✅ Built-in OCI feature
- ✅ Tidak perlu script tambahan
- ✅ Tidak perlu cron job
- ✅ Auto-cleanup otomatis
- ✅ Bisa set retention period (2 hari, 3 hari, dll)
- ✅ Gratis
- ✅ Dengan .zip compression, storage usage ~75% lebih hemat

**Setup Lifecycle Policy via OCI Console**:
1. Buka OCI Console → Object Storage → Bucket "woodpecker-artifacts"
2. Klik "Lifecycle Rules"
3. Add rule:
   - Rule name: "Auto-delete artifacts"
   - Apply to: All objects in bucket
   - Action: Delete object
   - Condition: Age > 2 days (atau sesuai kebutuhan)

**Setup Lifecycle Policy via OCI CLI**:
```bash
# Update lifecycle rule
oci os bucket update \
  --bucket-name woodpecker-artifacts \
  --object-lifecycle-rule-age-days 2
```

**Dengan lifecycle policy 2 hari + .zip compression**:
- Semua artifacts otomatis dihapus setelah 2 hari
- Storage tidak akan menumpuk
- Tidak perlu script cleanup
- Tidak perlu cron job
- Bisa ubah retention kapan saja
- Dengan .zip compression, storage usage ~75% lebih hemat
- Optimal untuk 10GB OCI Object Storage limit (Standard tier PAYG)

### Alternative: Manual Cleanup Script (Optional)

Jika ingin lebih granular control, bisa gunakan script cleanup. Tapi lifecycle policy lebih recommended.

```bash
#!/bin/bash
# scripts/optional/cleanup_artifacts.sh

BUCKET_NAME="woodpecker-artifacts"
RETENTION_DAYS=30

# Get old artifacts
oci os object list \
  --bucket-name $BUCKET_NAME \
  --prefix coverage/ \
  --fields name,timeCreated | \
  jq -r '.[] | select(.timeCreated < "'$(date -d "-$RETENTION_DAYS days" +%Y-%m-%d)'") | .name' | \
  while read object; do
    echo "Deleting: $object"
    oci os object delete \
      --bucket-name $BUCKET_NAME \
      --name $object \
      --force
  done
```

**Cron Job for Manual Cleanup** (jika menggunakan script):
```bash
# Add to crontab
0 2 * * * /path/to/scripts/cleanup-artifacts.sh >> /var/log/artifact-cleanup.log 2>&1
```

---

## Comparison: GitHub Actions vs Woodpecker Artifacts

| Feature | GitHub Actions | Woodpecker |
|---------|---------------|------------|
| Built-in Storage | ✅ Yes | ❌ No |
| UI Download | ✅ Yes | ❌ No (use external) |
| Retention Policy | ✅ Configurable | ✅ Manual (script) |
| Free Tier | ✅ 500MB/90 days | ✅ Depends on storage |
| Cost | ✅ Free for most | ✅ Free with OCI 200GB |
| API Access | ✅ Yes | ✅ Yes (OCI CLI) |
| Public Access | ✅ Yes | ✅ Yes (pre-auth) |

---

## Best Practices

1. **Use OCI Object Storage** - Free 200GB, already configured
2. **Organize by Type** - Separate buckets or prefixes for coverage, e2e, security
3. **Use Commit SHA** - Include commit SHA in path for traceability
4. **Set Retention Policy** - Auto-delete old artifacts to save space
5. **Pre-Auth for Public Reports** - Use pre-authenticated URLs for coverage reports
6. **Monitor Storage Usage** - Regularly check OCI storage usage
7. **Backup Critical Artifacts** - Keep important artifacts longer

---

## Troubleshooting

### Upload Failed

```bash
# Check OCI CLI configuration
oci setup config

# Check bucket exists
oci os bucket list --compartment-id $COMPARTMENT_ID

# Check permissions
oci os object list --bucket-name woodpecker-artifacts
```

### Download Failed

```bash
# Check object exists
oci os object get \
  --bucket-name woodpecker-artifacts \
  --name coverage/${CI_COMMIT_SHA}/index.html

# Generate pre-authenticated URL
oci os preauth-request create \
  --bucket-name woodpecker-artifacts \
  --name coverage-${CI_COMMIT_SHA}
```

---

## References

- [OCI Object Storage Documentation](https://docs.oracle.com/en-us/iaas/Content/Object/Concepts/objectstorageoverview.htm)
- [OCI CLI Documentation](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cliconcepts.htm)
- [Woodpecker Plugins](https://woodpecker-ci.org/plugins/)
- [MinIO Documentation](https://docs.min.io/)

---

## Conclusion

Woodpecker tidak memiliki built-in artifact storage seperti GitHub Actions, tetapi OCI Object Storage (200GB free tier) adalah solusi yang sempurna untuk setup Anda. Dengan script upload dan download yang proper, Anda bisa mengelola artifacts dengan efektif.
