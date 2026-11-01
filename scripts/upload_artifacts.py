#!/usr/bin/env python3
"""
Upload artifacts to OCI Object Storage with optional compression

Usage:
    python3 scripts/upload_artifacts.py --bucket woodpecker-artifacts --source coverage/ --destination coverage/${CI_COMMIT_SHA}/
    python3 scripts/upload_artifacts.py --bucket woodpecker-artifacts --source coverage/ --destination coverage/${CI_COMMIT_SHA}/ --compress
"""

import argparse
import os
import sys
import gzip
import shutil
from pathlib import Path
import logging
import tempfile

# Try to import OCI SDK
try:
    import oci
except ImportError:
    print("OCI SDK not installed. Install with: pip install oci")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def compress_file(file_path, output_path):
    """Compress a file using gzip"""
    with open(file_path, 'rb') as f_in:
        with gzip.open(output_path, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
    return output_path


def upload_artifacts(bucket_name, source_dir, destination_prefix, compartment_id=None, compress=False):
    """
    Upload artifacts to OCI Object Storage

    Args:
        bucket_name: Name of the OCI Object Storage bucket
        source_dir: Source directory to upload
        destination_prefix: Destination prefix in bucket
        compartment_id: OCI compartment ID (optional, will use default if not provided)
        compress: Whether to compress files before upload (gzip)
    """
    try:
        # Load OCI configuration
        config = oci.config.from_file()
        object_storage_client = oci.object_storage.ObjectStorageClient(config)

        # Get namespace
        logger.info("Getting namespace...")
        namespace = object_storage_client.get_namespace().data
        logger.info(f"Namespace: {namespace}")

        # Verify bucket exists
        logger.info(f"Verifying bucket '{bucket_name}' exists...")
        try:
            object_storage_client.get_bucket(namespace, bucket_name)
            logger.info(f"Bucket '{bucket_name}' found")
        except oci.exceptions.ServiceError as e:
            logger.error(f"Bucket '{bucket_name}' not found: {e}")
            sys.exit(1)

        # Upload files
        source_path = Path(source_dir)
        if not source_path.exists():
            logger.error(f"Source directory '{source_dir}' does not exist")
            sys.exit(1)

        uploaded_count = 0
        failed_count = 0
        skipped_count = 0
        total_original_size = 0
        total_compressed_size = 0

        logger.info(f"Starting upload from '{source_dir}' to '{destination_prefix}'...")
        if compress:
            logger.info("Compression enabled (gzip)")

        # Create temporary directory for compressed files
        temp_dir = None
        if compress:
            temp_dir = tempfile.mkdtemp(prefix='woodpecker_upload_')

        for file_path in source_path.rglob('*'):
            if file_path.is_file():
                # Create destination path
                relative_path = file_path.relative_to(source_path)
                object_name = f"{destination_prefix}/{relative_path}"

                if compress:
                    # Compress file
                    object_name = f"{object_name}.gz"
                    temp_file_path = Path(temp_dir) / f"{relative_path}.gz"
                    temp_file_path.parent.mkdir(parents=True, exist_ok=True)

                    original_size = file_path.stat().st_size
                    compress_file(file_path, temp_file_path)
                    compressed_size = temp_file_path.stat().st_size

                    total_original_size += original_size
                    total_compressed_size += compressed_size

                    compression_ratio = (1 - (compressed_size / original_size)) * 100

                    upload_file = temp_file_path
                    logger.info(f"Compressed: {file_path.name} ({original_size} → {compressed_size} bytes, {compression_ratio:.1f}% reduction)")
                else:
                    upload_file = file_path
                    total_original_size += file_path.stat().st_size
                    total_compressed_size += file_path.stat().st_size

                try:
                    # Upload file
                    with open(upload_file, 'rb') as f:
                        object_storage_client.put_object(
                            namespace_name=namespace,
                            bucket_name=bucket_name,
                            object_name=object_name,
                            put_object_body=f
                        )

                    uploaded_count += 1
                    logger.info(f"Uploaded: {object_name}")

                except Exception as e:
                    failed_count += 1
                    logger.error(f"Failed to upload {object_name}: {e}")

        # Cleanup temp directory
        if temp_dir and compress:
            shutil.rmtree(temp_dir)

        logger.info(f"Upload complete:")
        logger.info(f"  - Uploaded: {uploaded_count} files")
        logger.info(f"  - Failed: {failed_count} files")
        logger.info(f"  - Skipped: {skipped_count} files")

        if compress:
            logger.info(f"  - Original size: {total_original_size / 1024 / 1024:.2f} MB")
            logger.info(f"  - Compressed size: {total_compressed_size / 1024 / 1024:.2f} MB")
            compression_ratio = (1 - (total_compressed_size / total_original_size)) * 100
            logger.info(f"  - Total compression: {compression_ratio:.1f}% reduction")

        if failed_count > 0:
            sys.exit(1)

    except Exception as e:
        logger.error(f"Error uploading artifacts: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description='Upload artifacts to OCI Object Storage with optional compression',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Upload coverage reports (no compression)
  python3 scripts/upload_artifacts.py \\
    --bucket woodpecker-artifacts \\
    --source coverage/ \\
    --destination coverage/${CI_COMMIT_SHA}/

  # Upload with compression (recommended)
  python3 scripts/upload_artifacts.py \\
    --bucket woodpecker-artifacts \\
    --source coverage/ \\
    --destination coverage/${CI_COMMIT_SHA}/ \\
    --compress

  # Upload E2E test results with compression
  python3 scripts/upload_artifacts.py \\
    --bucket woodpecker-artifacts \\
    --source playwright-report/ \\
    --destination e2e/${CI_COMMIT_SHA}/ \\
    --compress

  # Upload with custom compartment
  python3 scripts/upload_artifacts.py \\
    --bucket woodpecker-artifacts \\
    --source coverage/ \\
    --destination coverage/${CI_COMMIT_SHA}/ \\
    --compartment-id ocid1.compartment.oc1...
        """
    )

    parser.add_argument(
        '--bucket',
        required=True,
        help='OCI Object Storage bucket name'
    )

    parser.add_argument(
        '--source',
        required=True,
        help='Source directory to upload'
    )

    parser.add_argument(
        '--destination',
        required=True,
        help='Destination prefix in bucket (e.g., coverage/${CI_COMMIT_SHA}/)'
    )

    parser.add_argument(
        '--compartment-id',
        help='OCI compartment ID (optional, uses default from config)'
    )

    parser.add_argument(
        '--compress',
        action='store_true',
        help='Compress files before upload using gzip (recommended for storage savings)'
    )

    args = parser.parse_args()

    upload_artifacts(
        bucket_name=args.bucket,
        source_dir=args.source,
        destination_prefix=args.destination,
        compartment_id=args.compartment_id,
        compress=args.compress
    )


if __name__ == '__main__':
    main()
