#!/bin/bash

# Deploy flash loan contracts to Coreum network

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env file not found. Please create one from .env.example${NC}"
    exit 1
fi

# Default values
NETWORK=${COREUM_NETWORK:-testnet}
CHAIN_ID=${COREUM_CHAIN_ID:-coreum-testnet-1}
NODE=${COREUM_RPC_ENDPOINT:-https://full-node.testnet-1.coreum.dev:26657}
FEE_PERCENTAGE=${FEE_PERCENTAGE:-0.003}

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Coreum Flash Loan Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Network:  ${GREEN}$NETWORK${NC}"
echo -e "Chain ID: ${GREEN}$CHAIN_ID${NC}"
echo -e "Node:     ${GREEN}$NODE${NC}"
echo ""

# Check if cored is installed
if ! command -v cored &> /dev/null; then
    echo -e "${RED}Error: cored is not installed${NC}"
    echo "Please install cored from: https://docs.coreum.dev/tutorials/cored.html"
    exit 1
fi

# Check if artifacts exist
if [ ! -d "artifacts" ]; then
    echo -e "${YELLOW}Artifacts not found. Building contracts first...${NC}"
    ./scripts/build.sh
fi

echo -e "${BLUE}Step 1: Uploading Flash Loan Contract${NC}"

# Upload flash loan contract
TX_HASH=$(cored tx wasm store artifacts/cw_flash_loan.wasm \
    --from $WALLET_ADDRESS \
    --gas auto \
    --gas-adjustment 1.3 \
    --gas-prices ${GAS_PRICE} \
    --chain-id $CHAIN_ID \
    --node $NODE \
    --broadcast-mode block \
    --yes \
    --output json | jq -r '.txhash')

echo -e "${GREEN}✓ Flash Loan contract uploaded. TX: $TX_HASH${NC}"

# Get code ID
sleep 2
FLASH_LOAN_CODE_ID=$(cored query tx $TX_HASH \
    --node $NODE \
    --output json | jq -r '.logs[0].events[] | select(.type=="store_code") | .attributes[] | select(.key=="code_id") | .value')

echo -e "Flash Loan Code ID: ${GREEN}$FLASH_LOAN_CODE_ID${NC}"

echo ""
echo -e "${BLUE}Step 2: Uploading Simple Receiver Contract${NC}"

# Upload simple receiver contract
TX_HASH=$(cored tx wasm store artifacts/cw_simple_loan_receiver.wasm \
    --from $WALLET_ADDRESS \
    --gas auto \
    --gas-adjustment 1.3 \
    --gas-prices ${GAS_PRICE} \
    --chain-id $CHAIN_ID \
    --node $NODE \
    --broadcast-mode block \
    --yes \
    --output json | jq -r '.txhash')

echo -e "${GREEN}✓ Simple Receiver contract uploaded. TX: $TX_HASH${NC}"

# Get code ID
sleep 2
SIMPLE_RECEIVER_CODE_ID=$(cored query tx $TX_HASH \
    --node $NODE \
    --output json | jq -r '.logs[0].events[] | select(.type=="store_code") | .attributes[] | select(.key=="code_id") | .value')

echo -e "Simple Receiver Code ID: ${GREEN}$SIMPLE_RECEIVER_CODE_ID${NC}"

echo ""
echo -e "${BLUE}Step 3: Uploading IBC Receiver Contract${NC}"

# Upload IBC receiver contract
TX_HASH=$(cored tx wasm store artifacts/cw_ibc_loan_receiver.wasm \
    --from $WALLET_ADDRESS \
    --gas auto \
    --gas-adjustment 1.3 \
    --gas-prices ${GAS_PRICE} \
    --chain-id $CHAIN_ID \
    --node $NODE \
    --broadcast-mode block \
    --yes \
    --output json | jq -r '.txhash')

echo -e "${GREEN}✓ IBC Receiver contract uploaded. TX: $TX_HASH${NC}"

# Get code ID
sleep 2
IBC_RECEIVER_CODE_ID=$(cored query tx $TX_HASH \
    --node $NODE \
    --output json | jq -r '.logs[0].events[] | select(.type=="store_code") | .attributes[] | select(.key=="code_id") | .value')

echo -e "IBC Receiver Code ID: ${GREEN}$IBC_RECEIVER_CODE_ID${NC}"

echo ""
echo -e "${BLUE}Step 4: Instantiating Flash Loan Contract${NC}"

# Determine denom based on network
if [ "$NETWORK" == "mainnet" ]; then
    DENOM="ucore"
else
    DENOM="utestcore"
fi

# Create instantiate message
INIT_MSG=$(cat <<EOF
{
  "admin": ${ADMIN_ADDRESS:-null},
  "fee": "$FEE_PERCENTAGE",
  "loan_denom": {
    "native": {
      "denom": "$DENOM"
    }
  }
}
EOF
)

echo "Instantiate message: $INIT_MSG"

# Instantiate flash loan contract
TX_HASH=$(cored tx wasm instantiate $FLASH_LOAN_CODE_ID "$INIT_MSG" \
    --from $WALLET_ADDRESS \
    --label "flash-loan-$NETWORK" \
    --gas auto \
    --gas-adjustment 1.3 \
    --gas-prices ${GAS_PRICE} \
    --chain-id $CHAIN_ID \
    --node $NODE \
    --broadcast-mode block \
    --admin $WALLET_ADDRESS \
    --yes \
    --output json | jq -r '.txhash')

echo -e "${GREEN}✓ Flash Loan contract instantiated. TX: $TX_HASH${NC}"

# Get contract address
sleep 2
FLASH_LOAN_ADDRESS=$(cored query tx $TX_HASH \
    --node $NODE \
    --output json | jq -r '.logs[0].events[] | select(.type=="instantiate") | .attributes[] | select(.key=="_contract_address") | .value')

echo -e "Flash Loan Contract Address: ${GREEN}$FLASH_LOAN_ADDRESS${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Contract Details:"
echo -e "  Flash Loan Code ID: ${GREEN}$FLASH_LOAN_CODE_ID${NC}"
echo -e "  Flash Loan Address: ${GREEN}$FLASH_LOAN_ADDRESS${NC}"
echo -e "  Simple Receiver Code ID: ${GREEN}$SIMPLE_RECEIVER_CODE_ID${NC}"
echo -e "  IBC Receiver Code ID: ${GREEN}$IBC_RECEIVER_CODE_ID${NC}"
echo ""
echo "Update your .env file with:"
echo "FLASH_LOAN_CONTRACT_ADDRESS=$FLASH_LOAN_ADDRESS"
echo ""
echo "Next steps:"
echo "1. Update .env with contract addresses"
echo "2. Use CLI: ./cli/flash_loan_cli.py --network $NETWORK contract info flash-loan"
echo "3. Start WebUI: cd webui && npm start"
