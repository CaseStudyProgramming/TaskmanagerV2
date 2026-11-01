#!/bin/bash
# scripts/monitor_storage.sh
# Monitor storage usage in OCI Object Storage

set -e

BUCKET_NAME="${BUCKET_NAME:-woodpecker-artifacts}"

echo "=========================================="
echo "Storage Usage Report"
echo "=========================================="
echo "Bucket: $BUCKET_NAME"
echo "=========================================="

# Get total storage usage
TOTAL_SIZE=$(oci os object list \
  --bucket-name $BUCKET_NAME \
  --output json 2>/dev/null | \
  jq '[.[] | .size] | add // 0')

if [ -z "$TOTAL_SIZE" ] || [ "$TOTAL_SIZE" = "null" ]; then
  TOTAL_SIZE=0
fi

TOTAL_SIZE_GB=$(echo "scale=2; $TOTAL_SIZE / 1024 / 1024 / 1024" | bc 2>/dev/null || echo "0.00")
REMAINING_GB=$(echo "scale=2; 200 - $TOTAL_SIZE_GB" | bc 2>/dev/null || echo "200.00")
USAGE_PERCENT=$(echo "scale=0; ($TOTAL_SIZE_GB / 200) * 100" | bc 2>/dev/null || echo "0")

echo "Total Storage Used: ${TOTAL_SIZE_GB} GB / 200 GB"
echo "Remaining: ${REMAINING_GB} GB"
echo "Usage: ${USAGE_PERCENT}%"
echo "=========================================="

# Get usage by type
echo "Usage by Artifact Type:"
echo "----------------------------------------"

for prefix in coverage e2e build performance security logs; do
  SIZE=$(oci os object list \
    --bucket-name $BUCKET_NAME \
    --prefix $prefix/ \
    --output json 2>/dev/null | \
    jq '[.[] | .size] | add // 0')

  if [ -z "$SIZE" ] || [ "$SIZE" = "null" ]; then
    SIZE=0
  fi

  SIZE_GB=$(echo "scale=2; $SIZE / 1024 / 1024 / 1024" | bc 2>/dev/null || echo "0.00")
  SIZE_PERCENT=$(echo "scale=1; ($SIZE / $TOTAL_SIZE) * 100" | bc 2>/dev/null || echo "0")

  printf "%-20s %8s GB (%5s%%)\n" "$prefix:" "${SIZE_GB}" "${SIZE_PERCENT}"
done

echo "=========================================="

# Alert if usage > 80%
if [ $USAGE_PERCENT -gt 80 ]; then
  echo "⚠️  WARNING: Storage usage is ${USAGE_PERCENT}% (> 80%)"
  echo "Recommendation: Consider reducing retention periods"
  echo "or enable compression for artifacts."
  exit 1
elif [ $USAGE_PERCENT -gt 60 ]; then
  echo "⚠️  NOTICE: Storage usage is ${USAGE_PERCENT}% (> 60%)"
  echo "Monitor usage regularly."
  exit 0
else
  echo "✅ Storage usage is healthy (${USAGE_PERCENT}%)"
  exit 0
fi
