#!/bin/bash
# Load environment variables from .env
# Usage: source .devin/load-env.sh or .devin/load-env.sh <command>
# Note: For passwords with special characters, use dotenv-cli instead

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found"
    echo "Please create it from .env.example"
    exit 1
fi

echo "Loading environment variables from $ENV_FILE"

# Load env variables - simple approach
# Note: This may not handle all special characters correctly
# For complex passwords, use: dotenv -e .env -- command
set -a
source "$ENV_FILE"
set +a

if [ $# -gt 0 ]; then
    exec "$@"
fi
