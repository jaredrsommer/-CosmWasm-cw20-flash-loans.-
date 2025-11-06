# Coreum Flash Loan

A CosmWasm-based flash loan system for the Coreum blockchain, supporting both CW20 and native token flash loans.

## Overview

This project provides a complete flash loan infrastructure on Coreum network, including:

- **Smart Contracts**: Three CosmWasm contracts for flash loans and receivers
- **CLI Tool**: Python-based command-line interface for contract interaction
- **WebUI**: Modern React-based web interface with Keplr wallet integration
- **Deployment Scripts**: Automated deployment and testing tools

### What are Flash Loans?

Flash loans are uncollateralized loans that must be borrowed and repaid within a single transaction. They enable:
- Arbitrage opportunities
- Collateral swapping
- Liquidation operations
- Complex DeFi strategies

### How It Works

1. **Liquidity Providers** deposit tokens into the flash loan contract
2. **Borrowers** request flash loans through a receiver contract
3. The loan must be **repaid with fees** in the same transaction
4. **Fees are distributed** proportionally to liquidity providers

## Features

- **Native & CW20 Support**: Flash loans for both native tokens (CORE) and CW20 tokens
- **Fee Distribution**: Automatic proportional fee distribution to liquidity providers
- **Admin Control**: Optional admin for fee adjustments
- **IBC Support**: Cross-chain flash loans via IBC
- **CLI & WebUI**: Multiple interfaces for user interaction
- **Automated Deployment**: Scripts for easy deployment to Coreum networks

## Architecture

### Smart Contracts

#### 1. Flash Loan Contract (`cw-flash-loan`)
Main contract that manages liquidity and issues flash loans.

**Key Functions:**
- `Provide{}` - Add liquidity to earn fees
- `Withdraw{}` - Remove liquidity with earned fees
- `Loan{receiver, amount}` - Request a flash loan
- `UpdateConfig{admin, fee}` - Update configuration (admin only)

**Queries:**
- `GetConfig{}` - Get contract configuration
- `Provided{address}` - Get provided amount for an address
- `TotalProvided{}` - Get total liquidity
- `Entitled{address}` - Get entitled amount including fees
- `Balance{}` - Get contract balance

#### 2. Simple Loan Receiver (`cw-simple-loan-receiver`)
Example receiver contract demonstrating flash loan usage.

#### 3. IBC Loan Receiver (`cw-ibc-loan-receiver`)
IBC-enabled receiver for cross-chain flash loan operations.

## Prerequisites

- **Rust** (1.65+) with wasm32-unknown-unknown target
- **Docker** (for contract optimization)
- **Node.js** (16+) for WebUI
- **Python** (3.8+) for CLI
- **cored** (Coreum CLI) for deployment
- **Keplr Wallet** (for WebUI)

## Quick Start

### 1. Setup Environment

```bash
# Clone the repository
git clone <repository-url>
cd -CosmWasm-cw20-flash-loans.-

# Run setup script
./scripts/setup-coreum.sh

# Configure environment
cp .env.example .env
# Edit .env with your configuration
```

### 2. Build Contracts

```bash
# Build and optimize all contracts
./scripts/build.sh
```

This will create optimized WASM files in the `artifacts/` directory.

### 3. Run Tests

```bash
# Run all contract tests
./scripts/test.sh
```

### 4. Deploy to Coreum

```bash
# Deploy to testnet
./scripts/deploy.sh
```

Update your `.env` file with the deployed contract addresses.

### 5. Use CLI

```bash
cd cli

# Install dependencies
pip install -r requirements.txt

# View help
./flash_loan_cli.py --help

# Check configuration
./flash_loan_cli.py --network testnet config

# Provide liquidity
./flash_loan_cli.py --network testnet contract provide 1000000000

# Query contract
./flash_loan_cli.py --network testnet contract query-config
```

### 6. Use WebUI

```bash
cd webui

# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:3000` and connect your Keplr wallet.

## Project Structure

```
.
├── contracts/
│   ├── cw-flash-loan/              # Main flash loan contract
│   ├── cw-simple-loan-receiver/    # Example receiver
│   └── cw-ibc-loan-receiver/       # IBC receiver
├── cli/
│   ├── flash_loan_cli.py           # CLI tool
│   ├── requirements.txt            # Python dependencies
│   └── README.md                   # CLI documentation
├── webui/
│   ├── src/                        # React source code
│   ├── public/                     # Public assets
│   ├── package.json                # Node dependencies
│   └── README.md                   # WebUI documentation
├── scripts/
│   ├── setup-coreum.sh             # Environment setup
│   ├── build.sh                    # Build contracts
│   ├── test.sh                     # Run tests
│   └── deploy.sh                   # Deploy contracts
├── coreum-config.json              # Network configurations
├── .env.example                    # Environment template
└── README.md                       # This file
```

## Configuration

### Network Configuration

The project supports three Coreum networks:

- **Testnet** (default): `coreum-testnet-1`
- **Mainnet**: `coreum-mainnet-1`
- **Devnet**: `coreum-devnet-1`

Configuration is in `coreum-config.json`.

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Network
COREUM_NETWORK=testnet
COREUM_CHAIN_ID=coreum-testnet-1

# Wallet
MNEMONIC=your-24-word-mnemonic-phrase-here
WALLET_ADDRESS=testcore1...

# Contract Addresses (after deployment)
FLASH_LOAN_CONTRACT_ADDRESS=testcore1...

# Configuration
FEE_PERCENTAGE=0.003
GAS_PRICE=0.0625utestcore
```

## Usage Examples

### Provide Liquidity

**CLI:**
```bash
./cli/flash_loan_cli.py --network testnet contract provide 1000000000
```

**WebUI:**
1. Connect Keplr wallet
2. Navigate to "Provide Liquidity" tab
3. Enter amount
4. Click "Provide"

### Request Flash Loan

**CLI:**
```bash
./cli/flash_loan_cli.py --network testnet contract loan <receiver-address> 5000000000
```

**WebUI:**
1. Navigate to "Request Loan" tab
2. Enter receiver contract address
3. Enter loan amount
4. Click "Request Loan"

### Withdraw Liquidity

**CLI:**
```bash
./cli/flash_loan_cli.py --network testnet contract withdraw
```

**WebUI:**
1. Navigate to "Withdraw" tab
2. Click "Withdraw All"

### Query Contract

**CLI:**
```bash
# Get config
./cli/flash_loan_cli.py --network testnet contract query-config

# Get provided amount
./cli/flash_loan_cli.py --network testnet contract query-provided <address>

# Get balance
./cli/flash_loan_cli.py --network testnet contract query-balance
```

**WebUI:**
1. Navigate to "Query" tab
2. Select query type
3. Enter parameters
4. Click query button

## Development

### Building Contracts

```bash
# Build for development
cargo wasm

# Build optimized (production)
./scripts/build.sh
```

### Running Tests

```bash
# All tests
./scripts/test.sh

# Specific contract
cd contracts/cw-flash-loan
cargo test

# With output
cargo test -- --nocapture
```

### Generating Schemas

```bash
cd contracts/cw-flash-loan
cargo schema
```

Schemas are generated in `schema/` directory.

## Deployment

### Deploy to Testnet

1. **Setup wallet:**
```bash
# Create or import wallet
cored keys add my-wallet --recover

# Get testnet tokens from faucet
# Visit: https://docs.coreum.dev/tools-ecosystem/faucet.html
```

2. **Update .env:**
```env
COREUM_NETWORK=testnet
WALLET_ADDRESS=testcore1...
MNEMONIC=your-mnemonic-here
```

3. **Deploy:**
```bash
./scripts/deploy.sh
```

4. **Update contract addresses in .env**

### Deploy to Mainnet

⚠️ **Warning**: Thoroughly test on testnet first!

1. Update `.env` for mainnet:
```env
COREUM_NETWORK=mainnet
COREUM_CHAIN_ID=coreum-mainnet-1
```

2. Deploy:
```bash
./scripts/deploy.sh
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Unaudited Code**: This contract is unaudited. Use at your own risk.
2. **No Migration**: Contracts do not support migration. Deploy carefully.
3. **Test Thoroughly**: Always test on testnet before mainnet deployment.
4. **Flash Loan Risks**: Ensure receiver contracts properly repay loans.
5. **Private Keys**: Never commit private keys or mnemonics.
6. **Admin Control**: Set admin to a DAO or multi-sig for production.

## Gas Optimization

- Contracts are optimized using `cosmwasm/rust-optimizer`
- Typical gas costs on Coreum:
  - Store code: ~2-3M gas
  - Instantiate: ~200-300K gas
  - Provide: ~150-200K gas
  - Loan: ~300-400K gas
  - Withdraw: ~150-200K gas

## Troubleshooting

### Contract Build Fails

```bash
# Update Rust
rustup update

# Add wasm target
rustup target add wasm32-unknown-unknown

# Clean and rebuild
cargo clean
cargo wasm
```

### Deployment Fails

1. Check wallet balance: `cored query bank balances <address>`
2. Verify network connectivity
3. Increase gas: `--gas auto --gas-adjustment 1.5`
4. Check `cored` version matches network

### CLI Not Working

```bash
# Reinstall dependencies
pip install -r cli/requirements.txt

# Check Python version
python3 --version  # Should be 3.8+
```

### WebUI Not Connecting

1. Install Keplr wallet extension
2. Unlock Keplr
3. Check network configuration in `webui/src/config.ts`
4. Clear browser cache
5. Check browser console for errors

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Resources

- [Coreum Documentation](https://docs.coreum.dev/)
- [CosmWasm Documentation](https://docs.cosmwasm.com/)
- [Coreum Discord](https://discord.gg/coreum)
- [Coreum GitHub](https://github.com/CoreumFoundation)

## License

AGPL-3.0 - See [LICENSE](LICENSE) file for details.

## Disclaimer

This software is provided "as is" without warranty of any kind. This contract is unaudited and does not yet support migrations. Do not use this for anything mission critical. The authors and contributors are not responsible for any losses incurred through the use of this software.

## Support

For issues and questions:
- Open an issue on GitHub
- Join Coreum Discord
- Check documentation

## Roadmap

- [ ] Smart contract audit
- [ ] Migration support
- [ ] Multi-token support in single contract
- [ ] Advanced fee structures
- [ ] Governance integration
- [ ] Additional receiver examples
- [ ] Testing suite expansion
- [ ] Gas optimization improvements

---

Built with ❤️ for the Coreum ecosystem
