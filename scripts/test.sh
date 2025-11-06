#!/bin/bash

# Run all tests for the flash loan contracts

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}Running CosmWasm contract tests...${NC}"
echo ""

# Run tests for each contract
for contract_dir in contracts/*/; do
    contract_name=$(basename "$contract_dir")
    echo -e "${BLUE}Testing $contract_name...${NC}"
    cd "$contract_dir"
    cargo test --lib
    cd "$PROJECT_ROOT"
    echo ""
done

echo -e "${GREEN}✓ All tests passed!${NC}"
