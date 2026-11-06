#!/usr/bin/env python3
"""
Helper functions for OCI operations.
Auto-reads OCI config to get tenancy/compartment IDs.
"""

import configparser
import os
from pathlib import Path

def get_oci_config(profile="DEFAULT"):
    """Read OCI config file and return config dict."""
    config_path = Path.home() / ".oci" / "config"
    if not config_path.exists():
        config_path = Path(os.environ.get("OCI_CONFIG_FILE", str(Path.home() / ".oci" / "config")))
    
    config = configparser.ConfigParser()
    config.read(config_path)
    
    if profile not in config:
        raise ValueError(f"Profile '{profile}' not found in {config_path}")
    
    return dict(config[profile])

def get_default_compartment_id(profile="DEFAULT"):
    """Get tenancy ID from OCI config (root compartment)."""
    config = get_oci_config(profile)
    tenancy_id = config.get("tenancy")
    if not tenancy_id:
        raise ValueError(f"Tenancy ID not found in profile '{profile}'")
    return tenancy_id

def get_oci_region(profile="DEFAULT"):
    """Get region from OCI config."""
    config = get_oci_config(profile)
    region = config.get("region")
    if not region:
        raise ValueError(f"Region not found in profile '{profile}'")
    return region

if __name__ == "__main__":
    # Test
    print(f"Compartment ID: {get_default_compartment_id()}")
    print(f"Region: {get_oci_region()}")
