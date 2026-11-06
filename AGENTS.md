# Agent Guide for This Project

## OCI (Oracle Cloud Infrastructure) Operations

### Important: Compartment ID Not Auto-Loaded

The OCI MCP server (`oracle-oci-cloud-mcp-server`) is a **thin wrapper** over the OCI Python SDK. It uses the OCI config file (`~/.oci/config`) for **authentication only**, but does **NOT** automatically load the compartment_id for API calls.

**Config location:** `/home/davidtan/.oci/config`

### Getting Compartment ID

**Option 1: Use the helper script**
```bash
python3 .devin/oci_helpers.py
```

This reads the OCI config and returns the tenancy ID (which is the root compartment).

**Option 2: Read config directly**
The OCI config file contains:
- `tenancy` = root compartment ID
- `region` = OCI region
- Other auth credentials

### List VMs/Instances

When calling OCI APIs that require `compartment_id`, you must provide it explicitly:

**Example using MCP server:**
```python
# First get compartment ID from config
compartment_id = "ocid1.tenancy.oc1..aaaaaaaazyrx7bpogfwigffvcp4oxmgbecpxqtzc76h55oz2kunkidwl4xjq"

# Then call the API
mcp_call_tool(
    server_name="oracle-oci-cloud-mcp-server",
    tool_name="invoke_oci_api",
    arguments={
        "client_fqn": "oci.core.ComputeClient",
        "operation": "list_instances",
        "params": {"compartment_id": compartment_id}
    }
)
```

### Common OCI Operations

| Operation | Client | Example |
|-----------|--------|---------|
| List instances | `oci.core.ComputeClient` | `list_instances(compartment_id)` |
| Get instance details | `oci.core.ComputeClient` | `get_instance(instance_id)` |
| List compartments | `oci.identity.IdentityClient` | `list_compartments(compartment_id)` |
| List VCNs | `oci.core.VirtualNetworkClient` | `list_vcns(compartment_id)` |

### Why This Behavior?

This is by design in the OCI SDK:
- Config = authentication credentials only
- Compartment ID = explicit parameter for each API call
- Allows users to list resources in specific compartments, not just root
- Provides flexibility for multi-compartment workflows

### Available OCI MCP Tools

- `list_oci_clients` - List available SDK clients
- `find_oci_api` - Search for operations by keyword
- `describe_oci_operation` - Get operation details and parameters
- `invoke_oci_api` - Call an OCI SDK method
- `list_client_operations` - List operations for a specific client
