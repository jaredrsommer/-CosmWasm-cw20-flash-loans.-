#!/bin/bash

# Build and optimize all CosmWasm contracts for Coreum deployment

set -e

echo "Building CosmWasm contracts..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}Step 1: Building contracts with cargo...${NC}"

# Build each contract
for contract_dir in contracts/*/; do
    contract_name=$(basename "$contract_dir")
    echo -e "${GREEN}Building $contract_name...${NC}"
    cd "$contract_dir"
    cargo wasm
    cd "$PROJECT_ROOT"
done

echo -e "${BLUE}Step 2: Optimizing contracts...${NC}"

# Check if rust-optimizer is available
if ! command -v docker &> /dev/null; then
    echo "Docker is required but not installed. Please install Docker and try again."
    exit 1
fi

# Optimize all contracts using cosmwasm/rust-optimizer
docker run --rm -v "$PROJECT_ROOT":/code \
  --mount type=volume,source="$(basename "$PROJECT_ROOT")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.15.0

echo -e "${GREEN}✓ All contracts built and optimized successfully!${NC}"
echo ""
echo "Optimized WASM files are in: ./artifacts/"
echo ""
echo "Next steps:"
echo "1. Test the contracts: ./scripts/test.sh"
echo "2. Deploy to Coreum: ./scripts/deploy.sh"
