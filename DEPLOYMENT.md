# Deployment Guide for Coreum Flash Loan

This guide provides detailed step-by-step instructions for deploying the flash loan contracts to Coreum network.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Building Contracts](#building-contracts)
4. [Testing Contracts](#testing-contracts)
5. [Deploying to Testnet](#deploying-to-testnet)
6. [Deploying to Mainnet](#deploying-to-mainnet)
7. [Verifying Deployment](#verifying-deployment)
8. [Post-Deployment Setup](#post-deployment-setup)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Rust & Cargo**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   rustup target add wasm32-unknown-unknown
   ```

2. **Docker**
   - Download from: https://docs.docker.com/get-docker/
   - Verify installation: `docker --version`

3. **Coreum CLI (cored)**

   **Linux:**
   ```bash
   curl -LO https://github.com/CoreumFoundation/coreum/releases/latest/download/cored-linux-amd64
   chmod +x cored-linux-amd64
   sudo mv cored-linux-amd64 /usr/local/bin/cored
   ```

   **macOS:**
   ```bash
   curl -LO https://github.com/CoreumFoundation/coreum/releases/latest/download/cored-darwin-amd64
   chmod +x cored-darwin-amd64
   sudo mv cored-darwin-amd64 /usr/local/bin/cored
   ```

   Verify: `cored version`

4. **jq** (for JSON parsing)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install jq

   # macOS
   brew install jq
   ```

### Required Accounts & Tokens

1. **Coreum Wallet**
   ```bash
   # Create new wallet
   cored keys add my-wallet

   # Or import existing wallet
   cored keys add my-wallet --recover
   ```

2. **Testnet Tokens**
   - Visit Coreum faucet: https://docs.coreum.dev/tools-ecosystem/faucet.html
   - Request testnet tokens (TESTCORE)
   - Minimum recommended: 10 TESTCORE

3. **Mainnet Tokens**
   - Purchase CORE tokens from exchanges
   - Transfer to your wallet
   - Minimum recommended: 1 CORE for deployment

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd -CosmWasm-cw20-flash-loans.-
```

### 2. Run Setup Script

```bash
./scripts/setup-coreum.sh
```

This script will:
- Verify Rust installation
- Add wasm32 target
- Check Docker
- Check cored installation
- Create `.env` file

### 3. Configure Environment

Edit `.env` file:

```env
# Network Selection
COREUM_NETWORK=testnet
COREUM_CHAIN_ID=coreum-testnet-1
COREUM_RPC_ENDPOINT=https://full-node.testnet-1.coreum.dev:26657
COREUM_GRPC_ENDPOINT=https://full-node.testnet-1.coreum.dev:9090
COREUM_REST_ENDPOINT=https://full-node.testnet-1.coreum.dev:1317

# Wallet Configuration
MNEMONIC=your twenty four word mnemonic phrase goes here today example seed words continue
WALLET_ADDRESS=testcore1abcdefghijklmnopqrstuvwxyz1234567890

# Gas Configuration
GAS_PRICE=0.0625utestcore

# Contract Configuration
FEE_PERCENTAGE=0.003
ADMIN_ADDRESS=  # Leave empty for no admin, or set to DAO address
```

### 4. Verify Configuration

```bash
# Check wallet balance
cored query bank balances $(cored keys show my-wallet -a) \
  --chain-id coreum-testnet-1 \
  --node https://full-node.testnet-1.coreum.dev:26657
```

## Building Contracts

### 1. Build for Development

```bash
# Build all contracts (unoptimized)
cd contracts/cw-flash-loan
cargo wasm
cd ../..
```

### 2. Build for Production

```bash
# Build optimized contracts (required for deployment)
./scripts/build.sh
```

This will:
- Build all contracts with `cargo wasm`
- Optimize using `cosmwasm/rust-optimizer`
- Output optimized WASM files to `artifacts/`

Expected output:
```
artifacts/
├── cw_flash_loan.wasm
├── cw_simple_loan_receiver.wasm
├── cw_ibc_loan_receiver.wasm
├── checksums.txt
└── checksums_intermediate.txt
```

### 3. Verify Build

```bash
# Check WASM files exist
ls -lh artifacts/*.wasm

# Expected sizes (approximate):
# cw_flash_loan.wasm: ~150-200KB
# cw_simple_loan_receiver.wasm: ~100-150KB
# cw_ibc_loan_receiver.wasm: ~100-150KB
```

## Testing Contracts

### 1. Run Unit Tests

```bash
./scripts/test.sh
```

Or test individual contracts:

```bash
cd contracts/cw-flash-loan
cargo test --lib

# With output
cargo test --lib -- --nocapture

# Specific test
cargo test test_simple_loan
```

### 2. Verify Test Results

All tests should pass:
```
running 2 tests
test tests::test_simple_loan ... ok
test cw20_tests::test_cw20_loan ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured
```

## Deploying to Testnet

### 1. Pre-Deployment Checklist

- [ ] Contracts built and optimized
- [ ] All tests passing
- [ ] `.env` configured for testnet
- [ ] Wallet has sufficient balance (>= 5 TESTCORE)
- [ ] cored CLI installed and working

### 2. Run Deployment Script

```bash
./scripts/deploy.sh
```

The script will:
1. Upload flash loan contract → Get Code ID
2. Upload simple receiver contract → Get Code ID
3. Upload IBC receiver contract → Get Code ID
4. Instantiate flash loan contract → Get Contract Address

### 3. Manual Deployment (Alternative)

If you prefer manual deployment:

#### Step 1: Upload Flash Loan Contract

```bash
TX_HASH=$(cored tx wasm store artifacts/cw_flash_loan.wasm \
  --from my-wallet \
  --gas auto \
  --gas-adjustment 1.3 \
  --gas-prices 0.0625utestcore \
  --chain-id coreum-testnet-1 \
  --node https://full-node.testnet-1.coreum.dev:26657 \
  --broadcast-mode block \
  --yes \
  --output json | jq -r '.txhash')

echo "Transaction Hash: $TX_HASH"
```

#### Step 2: Get Code ID

```bash
sleep 2
CODE_ID=$(cored query tx $TX_HASH \
  --node https://full-node.testnet-1.coreum.dev:26657 \
  --output json | jq -r '.logs[0].events[] | select(.type=="store_code") | .attributes[] | select(.key=="code_id") | .value')

echo "Code ID: $CODE_ID"
```

#### Step 3: Instantiate Contract

```bash
INIT_MSG='{
  "admin": null,
  "fee": "0.003",
  "loan_denom": {
    "native": {
      "denom": "utestcore"
    }
  }
}'

TX_HASH=$(cored tx wasm instantiate $CODE_ID "$INIT_MSG" \
  --from my-wallet \
  --label "flash-loan-testnet" \
  --gas auto \
  --gas-adjustment 1.3 \
  --gas-prices 0.0625utestcore \
  --chain-id coreum-testnet-1 \
  --node https://full-node.testnet-1.coreum.dev:26657 \
  --broadcast-mode block \
  --admin $(cored keys show my-wallet -a) \
  --yes \
  --output json | jq -r '.txhash')

echo "Transaction Hash: $TX_HASH"
```

#### Step 4: Get Contract Address

```bash
sleep 2
CONTRACT_ADDRESS=$(cored query tx $TX_HASH \
  --node https://full-node.testnet-1.coreum.dev:26657 \
  --output json | jq -r '.logs[0].events[] | select(.type=="instantiate") | .attributes[] | select(.key=="_contract_address") | .value')

echo "Contract Address: $CONTRACT_ADDRESS"
```

### 4. Save Deployment Info

Update `.env` with deployed contract address:

```env
FLASH_LOAN_CONTRACT_ADDRESS=testcore1abc...xyz
```

Save deployment details to a file:

```bash
cat > deployment-testnet.json <<EOF
{
  "network": "testnet",
  "chain_id": "coreum-testnet-1",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": {
    "flash_loan": {
      "code_id": "$FLASH_LOAN_CODE_ID",
      "address": "$FLASH_LOAN_ADDRESS",
      "admin": "$(cored keys show my-wallet -a)"
    }
  },
  "configuration": {
    "fee": "0.003",
    "denom": "utestcore"
  }
}
EOF
```

## Deploying to Mainnet

### 1. Pre-Mainnet Checklist

- [ ] Thoroughly tested on testnet
- [ ] All functionality verified
- [ ] Security review completed
- [ ] Admin address decided (recommend DAO/multisig)
- [ ] Sufficient CORE tokens (>= 1 CORE)
- [ ] Backup of deployment scripts and configs

### 2. Update Configuration

Edit `.env` for mainnet:

```env
COREUM_NETWORK=mainnet
COREUM_CHAIN_ID=coreum-mainnet-1
COREUM_RPC_ENDPOINT=https://full-node.mainnet-1.coreum.dev:26657
COREUM_GRPC_ENDPOINT=https://full-node.mainnet-1.coreum.dev:9090
COREUM_REST_ENDPOINT=https://full-node.mainnet-1.coreum.dev:1317

WALLET_ADDRESS=core1...  # Mainnet address
MNEMONIC=...  # Mainnet wallet mnemonic

GAS_PRICE=0.0625ucore  # Mainnet denom

FEE_PERCENTAGE=0.003
ADMIN_ADDRESS=core1...  # Recommend DAO or multisig
```

### 3. Deploy

⚠️ **Final Warning**: This will deploy to mainnet with real funds!

```bash
./scripts/deploy.sh
```

### 4. Verify Mainnet Deployment

```bash
# Query contract info
cored query wasm contract $CONTRACT_ADDRESS \
  --node https://full-node.mainnet-1.coreum.dev:26657

# Query contract config
cored query wasm contract-state smart $CONTRACT_ADDRESS \
  '{"get_config": {}}' \
  --node https://full-node.mainnet-1.coreum.dev:26657
```

## Verifying Deployment

### 1. Query Contract Info

```bash
cored query wasm contract $CONTRACT_ADDRESS \
  --node $COREUM_RPC_ENDPOINT
```

Expected output:
```json
{
  "address": "testcore1...",
  "contract_info": {
    "code_id": "123",
    "creator": "testcore1...",
    "admin": "testcore1...",
    "label": "flash-loan-testnet"
  }
}
```

### 2. Query Contract State

```bash
# Get configuration
cored query wasm contract-state smart $CONTRACT_ADDRESS \
  '{"get_config": {}}' \
  --node $COREUM_RPC_ENDPOINT

# Expected output:
# {
#   "data": {
#     "admin": "testcore1...",
#     "fee": "0.003",
#     "loan_denom": {
#       "native": {
#         "denom": "utestcore"
#       }
#     }
#   }
# }
```

### 3. Query Contract Balance

```bash
cored query wasm contract-state smart $CONTRACT_ADDRESS \
  '{"balance": {}}' \
  --node $COREUM_RPC_ENDPOINT
```

### 4. Test Contract Interaction

```bash
# Provide liquidity (test transaction)
cored tx wasm execute $CONTRACT_ADDRESS \
  '{"provide": {}}' \
  --amount 1000000utestcore \
  --from my-wallet \
  --gas auto \
  --gas-adjustment 1.3 \
  --gas-prices 0.0625utestcore \
  --chain-id $COREUM_CHAIN_ID \
  --node $COREUM_RPC_ENDPOINT \
  --yes
```

## Post-Deployment Setup

### 1. Update Configuration Files

Update all config files with deployed addresses:

```bash
# Update .env
echo "FLASH_LOAN_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env

# Update WebUI config
vim webui/src/config.ts
# Update CONTRACT_ADDRESSES for your network
```

### 2. Setup CLI

```bash
cd cli
pip install -r requirements.txt

# Test CLI
./flash_loan_cli.py --network testnet config
./flash_loan_cli.py --network testnet contract info flash-loan
```

### 3. Setup WebUI

```bash
cd webui
npm install

# Update .env
echo "REACT_APP_FLASH_LOAN_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > .env

# Start WebUI
npm start
```

### 4. Document Deployment

Create deployment documentation:

```bash
cat > DEPLOYED_CONTRACTS.md <<EOF
# Deployed Contracts

## Testnet
- **Chain ID**: coreum-testnet-1
- **Deployed**: $(date)
- **Flash Loan**: $FLASH_LOAN_ADDRESS
- **Code ID**: $FLASH_LOAN_CODE_ID
- **Admin**: $(cored keys show my-wallet -a)
- **Fee**: 0.003 (0.3%)
- **Denom**: utestcore

## Contract Links
- [Flash Loan Contract](https://explorer.testnet-1.coreum.dev/coreum/accounts/$FLASH_LOAN_ADDRESS)

EOF
```

## Troubleshooting

### Issue: Contract Upload Fails

**Error**: `out of gas`

**Solution**:
```bash
# Increase gas adjustment
--gas auto --gas-adjustment 1.5

# Or specify manual gas
--gas 3000000
```

### Issue: Insufficient Funds

**Error**: `insufficient funds`

**Solution**:
```bash
# Check balance
cored query bank balances $(cored keys show my-wallet -a) \
  --chain-id coreum-testnet-1 \
  --node https://full-node.testnet-1.coreum.dev:26657

# Get testnet tokens from faucet
# Visit: https://docs.coreum.dev/tools-ecosystem/faucet.html
```

### Issue: Transaction Timeout

**Error**: `timeout waiting for tx`

**Solution**:
```bash
# Use broadcast-mode sync instead of block
--broadcast-mode sync

# Then query transaction status
cored query tx $TX_HASH --node $COREUM_RPC_ENDPOINT
```

### Issue: Contract Instantiation Fails

**Error**: `instantiate wasm contract failed`

**Solution**:
1. Check instantiate message format
2. Verify code ID is correct
3. Check admin address is valid
4. Review contract logs:
   ```bash
   cored query tx $TX_HASH --node $COREUM_RPC_ENDPOINT -o json | jq '.raw_log'
   ```

### Issue: Wrong Network

**Error**: `account ... does not exist on chain`

**Solution**:
- Verify `.env` has correct network settings
- Check wallet address matches network prefix:
  - Testnet: `testcore1...`
  - Mainnet: `core1...`

## Best Practices

1. **Always Test First**: Deploy to testnet before mainnet
2. **Use Version Control**: Tag releases before deployment
3. **Document Everything**: Keep deployment logs and configs
4. **Set Proper Admin**: Use DAO or multisig for mainnet
5. **Monitor Gas Prices**: Adjust for network conditions
6. **Backup Keys**: Secure wallet mnemonics
7. **Audit Code**: Get professional audit before mainnet
8. **Start Small**: Begin with limited liquidity
9. **Monitor Actively**: Watch contract activity post-deployment
10. **Have Rollback Plan**: Know how to handle issues

## Additional Resources

- [Coreum Documentation](https://docs.coreum.dev/)
- [CosmWasm Documentation](https://docs.cosmwasm.com/)
- [Coreum Explorer (Testnet)](https://explorer.testnet-1.coreum.dev/)
- [Coreum Explorer (Mainnet)](https://explorer.coreum.com/)
- [Coreum Discord](https://discord.gg/coreum)

## Support

For deployment issues:
1. Check this guide first
2. Review Coreum documentation
3. Join Coreum Discord
4. Open GitHub issue with deployment logs
