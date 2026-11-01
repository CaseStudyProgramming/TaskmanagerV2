#!/bin/bash
# scripts/cleanup_artifacts.sh
# Cleanup old artifacts from OCI Object Storage with tiered retention

set -e

BUCKET_NAME="${BUCKET_NAME:-woodpecker-artifacts}"

# Tiered retention policies (based on artifact types and value)
declare -A RETENTION_DAYS
RETENTION_DAYS["coverage"]=7
RETENTION_DAYS["e2e"]=30
RETENTION_DAYS["build"]=7
RETENTION_DAYS["performance"]=30
RETENTION_DAYS["security"]=90
RETENTION_DAYS["logs"]=7

echo "=========================================="
echo "Artifact Cleanup Script (Tiered Retention)"
echo "=========================================="
echo "Bucket: $BUCKET_NAME"
echo "=========================================="

TOTAL_DELETED=0

# Cleanup each type with different retention
for prefix in "${!RETENTION_DAYS[@]}"; do
  retention=${RETENTION_DAYS[$prefix]}
  cutoff_date=$(date -d "-${retention} days" +%Y-%m-%dT%H:%M:%SZ)

  echo "Cleaning up $prefix (retention: $retention days, cutoff: $cutoff_date)..."

  # Get objects for this prefix
  OBJECTS=$(oci os object list \
    --bucket-name $BUCKET_NAME \
    --prefix $prefix/ \
    --fields name,timeCreated \
    --output json 2>/dev/null || echo "[]")

  # Parse and delete old objects
  DELETED_COUNT=0
  echo "$OBJECTS" | jq -r '.[] | select(.timeCreated < "'$cutoff_date'") | .name' 2>/dev/null | while read object; do
    if [ -n "$object" ]; then
      echo "  Deleting: $object"
      oci os object delete \
        --bucket-name $BUCKET_NAME \
        --name $object \
        --force \
        --auth instance_principal 2>/dev/null
      ((DELETED_COUNT++))
      ((TOTAL_DELETED++))
    fi
  done

  echo "  Deleted: $DELETED_COUNT objects"
done

echo "=========================================="
echo "Cleanup Complete"
echo "Total Deleted: $TOTAL_DELETED objects"
echo "=========================================="
