# Coreum Flash Loan CLI

A command-line interface for interacting with the CosmWasm flash loan contracts on Coreum network.

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp ../.env.example .env
```

3. Edit `.env` with your configuration:
- Set your mnemonic phrase
- Configure network settings
- Add contract addresses after deployment

## Usage

### Show Configuration
```bash
./flash_loan_cli.py config
```

### List Available Networks
```bash
./flash_loan_cli.py networks
```

### Deploy Contracts

Deploy all contracts:
```bash
./flash_loan_cli.py deploy all
```

Deploy flash loan contract:
```bash
./flash_loan_cli.py deploy flash-loan --admin <ADDRESS> --fee 0.003 --denom ucore
```

### Query Contract Information

Get contract info:
```bash
./flash_loan_cli.py contract info flash-loan
```

Query contract configuration:
```bash
./flash_loan_cli.py contract query-config
```

Query contract balance:
```bash
./flash_loan_cli.py contract query-balance
```

Query provided amount for an address:
```bash
./flash_loan_cli.py contract query-provided <ADDRESS>
```

### Execute Contract Functions

Provide liquidity:
```bash
./flash_loan_cli.py contract provide 1000000
```

Withdraw liquidity:
```bash
./flash_loan_cli.py contract withdraw
```

Request a flash loan:
```bash
./flash_loan_cli.py contract loan <RECEIVER_ADDRESS> 1000000
```

### Network Selection

Use the `--network` flag to select a network:
```bash
./flash_loan_cli.py --network testnet config
./flash_loan_cli.py --network mainnet config
./flash_loan_cli.py --network devnet config
```

## Contract Addresses

After deploying contracts, update your `.env` file with the contract addresses:

```env
FLASH_LOAN_CONTRACT_ADDRESS=core1...
SIMPLE_RECEIVER_CONTRACT_ADDRESS=core1...
IBC_RECEIVER_CONTRACT_ADDRESS=core1...
```

## Available Commands

- `config` - Show current configuration
- `networks` - List available networks
- `deploy` - Deploy contracts
  - `all` - Deploy all contracts
  - `flash-loan` - Deploy flash loan contract
- `contract` - Interact with contracts
  - `info` - Get contract information
  - `query-config` - Query contract configuration
  - `query-balance` - Query contract balance
  - `query-provided` - Query provided amount
  - `provide` - Provide liquidity
  - `withdraw` - Withdraw liquidity
  - `loan` - Request a flash loan

## Examples

### Provide Liquidity
```bash
# Provide 1000 ucore to the flash loan contract
./flash_loan_cli.py --network testnet contract provide 1000000000
```

### Request a Loan
```bash
# Request a flash loan of 5000 ucore
./flash_loan_cli.py --network testnet contract loan <receiver-contract-address> 5000000000
```

### Check Your Provided Amount
```bash
./flash_loan_cli.py --network testnet contract query-provided <your-address>
```

## Notes

- All amounts are in the smallest unit (e.g., ucore for Coreum)
- Make sure to have enough balance for gas fees
- The CLI generates the commands - use `cored` CLI for actual execution
- For mainnet, use caution and test thoroughly on testnet first
