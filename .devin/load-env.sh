#!/bin/bash
# Load environment variables from .env.development
# Usage: source .devin/load-env.sh or .devin/load-env.sh <command>

ENV_FILE=".env.development"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found"
    echo "Please create it from .env.example"
    exit 1
fi

echo "Loading environment variables from $ENV_FILE"
export $(grep -v '^#' "$ENV_FILE" | xargs)

if [ $# -gt 0 ]; then
    exec "$@"
fi
