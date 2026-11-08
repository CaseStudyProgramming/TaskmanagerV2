#!/bin/bash
# Load environment variables from .env
# Usage: source .devin/load-env.sh or .devin/load-env.sh <command>

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found"
    echo "Please create it from .env.example"
    exit 1
fi

echo "Loading environment variables from $ENV_FILE"

# Load env variables - more robust handling of quotes and special chars
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip comments and empty lines
    [[ "$line" =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue

    # Export the variable
    export "$line"
done < "$ENV_FILE"

if [ $# -gt 0 ]; then
    exec "$@"
fi
