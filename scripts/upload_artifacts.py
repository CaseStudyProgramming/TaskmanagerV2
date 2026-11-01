#!/usr/bin/env python3
"""
Upload artifacts to OCI Object Storage with .zip compression

Usage:
    python3 scripts/upload_artifacts.py --bucket woodpecker-artifacts --source coverage/ --destination coverage/
"""

import argparse
import os
import sys
import zipfile
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


def compress_folder_to_zip(source_dir, output_zip):
    """Compress entire folder into a single .zip file"""
    source_path = Path(source_dir)
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in source_path.rglob('*'):
            if file_path.is_file():
                # Add file to zip with relative path
                arcname = file_path.relative_to(source_path.parent)
                zipf.write(file_path, arcname)
    
    return output_zip


def upload_artifacts(bucket_name, source_dir, destination_prefix, compartment_id=None):
    """
    Upload artifacts to OCI Object Storage with .zip compression

    Args:
        bucket_name: Name of the OCI Object Storage bucket
        source_dir: Source directory to upload
        destination_prefix: Destination prefix in bucket
        compartment_id: OCI compartment ID (optional, will use default if not provided)
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

        # Compress folder to .zip
        source_path = Path(source_dir)
        if not source_path.exists():
            logger.error(f"Source directory '{source_dir}' does not exist")
            sys.exit(1)

        logger.info(f"Compressing '{source_dir}' to .zip file...")
        
        # Create temp directory for zip file
        temp_dir = tempfile.mkdtemp(prefix='woodpecker_upload_')
        zip_filename = f"{source_path.name}.zip"
        zip_path = Path(temp_dir) / zip_filename
        
        # Compress folder to zip
        original_size = sum(f.stat().st_size for f in source_path.rglob('*') if f.is_file())
        compress_folder_to_zip(source_path, zip_path)
        compressed_size = zip_path.stat().st_size
        
        compression_ratio = (1 - (compressed_size / original_size)) * 100 if original_size > 0 else 0
        
        logger.info(f"Original size: {original_size / 1024 / 1024:.2f} MB")
        logger.info(f"Compressed size: {compressed_size / 1024 / 1024:.2f} MB")
        logger.info(f"Compression ratio: {compression_ratio:.1f}% reduction")

        # Upload zip file
        object_name = f"{destination_prefix}/{zip_filename}"
        logger.info(f"Uploading {object_name} to bucket '{bucket_name}'...")
        
        with open(zip_path, 'rb') as f:
            object_storage_client.put_object(
                namespace_name=namespace,
                bucket_name=bucket_name,
                object_name=object_name,
                put_object_body=f
            )

        logger.info(f"Upload complete: {object_name}")

        # Cleanup temp directory
        shutil.rmtree(temp_dir)

    except Exception as e:
        logger.error(f"Error uploading artifacts: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description='Upload artifacts to OCI Object Storage with .zip compression',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Upload coverage reports as .zip
  python3 scripts/upload_artifacts.py \\
    --bucket woodpecker-artifacts \\
    --source coverage/ \\
    --destination coverage/

  # Upload E2E test results as .zip
  python3 scripts/upload_artifacts.py \\
    --bucket woodpecker-artifacts \\
    --source playwright-report/ \\
    --destination e2e/

  # Upload with custom compartment
  python3 scripts/upload_artifacts.py \\
    --bucket woodpecker-artifacts \\
    --source coverage/ \\
    --destination coverage/ \\
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
        help='Destination prefix in bucket (e.g., coverage/)'
    )

    parser.add_argument(
        '--compartment-id',
        help='OCI compartment ID (optional, uses default from config)'
    )

    args = parser.parse_args()

    upload_artifacts(
        bucket_name=args.bucket,
        source_dir=args.source,
        destination_prefix=args.destination,
        compartment_id=args.compartment_id
    )


if __name__ == '__main__':
    main()
