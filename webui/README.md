# Coreum Flash Loan WebUI

A modern web interface for interacting with the CosmWasm flash loan contracts on Coreum network.

## Features

- Connect with Keplr wallet
- Provide liquidity to earn fees
- Withdraw liquidity with earned fees
- Request flash loans
- Query contract state and balances
- Support for both testnet and mainnet
- Responsive design for mobile and desktop

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Keplr Wallet](https://www.keplr.app/) browser extension
- Contract deployed on Coreum network

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp ../.env.example .env
```

3. Update contract addresses in `.env`:
```env
REACT_APP_FLASH_LOAN_CONTRACT_ADDRESS=your_contract_address_here
```

## Development

Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Build for Production

Build the optimized production version:
```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Configuration

### Network Configuration

Edit `src/config.ts` to modify network settings:
- Chain IDs
- RPC endpoints
- Gas prices
- Address prefixes

### Contract Addresses

Update contract addresses in `src/config.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  testnet: {
    flashLoan: 'testcore1...',
    simpleReceiver: 'testcore1...',
    ibcReceiver: 'testcore1...',
  },
  mainnet: {
    flashLoan: 'core1...',
    simpleReceiver: 'core1...',
    ibcReceiver: 'core1...',
  },
};
```

## Usage

### 1. Connect Wallet

Click "Connect Keplr Wallet" to connect your wallet. The app will:
- Suggest the Coreum chain to Keplr (if not already added)
- Request permission to access your wallet
- Display your connected address

### 2. Provide Liquidity

- Select the "Provide Liquidity" tab
- Enter the amount in the smallest unit (e.g., utestcore)
- Click "Provide" to send the transaction
- Confirm the transaction in Keplr

### 3. Withdraw Liquidity

- Select the "Withdraw" tab
- Click "Withdraw All" to withdraw your provided tokens plus fees
- Confirm the transaction in Keplr

### 4. Request Flash Loan

- Select the "Request Loan" tab
- Enter the receiver contract address
- Enter the loan amount
- Click "Request Loan"
- Confirm the transaction in Keplr

**Note:** The receiver contract must implement the flash loan callback and return the borrowed amount plus fees in the same transaction.

### 5. Query Contract State

- Select the "Query" tab
- Query provided amounts for any address
- Query the total contract balance
- View results in JSON format

## Project Structure

```
webui/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── hooks/
│   │   └── useWallet.ts    # Wallet connection hook
│   ├── App.tsx             # Main application component
│   ├── App.css             # Application styles
│   ├── config.ts           # Network and contract configuration
│   ├── index.tsx           # Application entry point
│   └── index.css           # Global styles
├── package.json            # Project dependencies
└── tsconfig.json          # TypeScript configuration
```

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **CosmJS** - Cosmos SDK JavaScript library
- **Keplr Wallet** - Cosmos wallet integration

## Troubleshooting

### Keplr Not Connecting

1. Make sure Keplr extension is installed and unlocked
2. Try refreshing the page
3. Check if Coreum network is suggested correctly

### Transaction Failing

1. Check you have enough balance for gas fees
2. Verify contract address is correct
3. Check the contract has sufficient liquidity for loans
4. Review error messages in browser console

### Contract Address Not Set

1. Deploy the contracts using the deployment scripts
2. Update the contract addresses in `.env`
3. Rebuild the application: `npm run build`

## Deployment

### Deploy to Netlify/Vercel

1. Build the production version:
```bash
npm run build
```

2. Deploy the `build/` directory to your hosting provider

3. Set environment variables in your hosting provider:
```
REACT_APP_FLASH_LOAN_CONTRACT_ADDRESS=core1...
```

### Deploy to IPFS

1. Build the production version:
```bash
npm run build
```

2. Upload the `build/` directory to IPFS using a service like:
   - [Pinata](https://pinata.cloud/)
   - [Fleek](https://fleek.co/)
   - [Web3.Storage](https://web3.storage/)

## Security Considerations

- Always test on testnet before using mainnet
- Verify contract addresses before interacting
- Review transaction details in Keplr before confirming
- Never share your private keys or mnemonics
- Use hardware wallets for large amounts

## License

AGPL-3.0 - See LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check Coreum documentation: https://docs.coreum.dev
- Join Coreum Discord: https://discord.gg/coreum
