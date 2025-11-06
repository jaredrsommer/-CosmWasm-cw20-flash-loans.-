export interface NetworkConfig {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  stakeCurrency: {
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
  };
  bech32Config: {
    bech32PrefixAccAddr: string;
    bech32PrefixAccPub: string;
    bech32PrefixValAddr: string;
    bech32PrefixValPub: string;
    bech32PrefixConsAddr: string;
    bech32PrefixConsPub: string;
  };
  currencies: Array<{
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
  }>;
  feeCurrencies: Array<{
    coinDenom: string;
    coinMinimalDenom: string;
    coinDecimals: number;
    gasPriceStep: {
      low: number;
      average: number;
      high: number;
    };
  }>;
}

export const COREUM_TESTNET: NetworkConfig = {
  chainId: 'coreum-testnet-1',
  chainName: 'Coreum Testnet',
  rpc: 'https://full-node.testnet-1.coreum.dev:26657',
  rest: 'https://full-node.testnet-1.coreum.dev:1317',
  stakeCurrency: {
    coinDenom: 'TESTCORE',
    coinMinimalDenom: 'utestcore',
    coinDecimals: 6,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'testcore',
    bech32PrefixAccPub: 'testcorepub',
    bech32PrefixValAddr: 'testcorevaloper',
    bech32PrefixValPub: 'testcorevaloperpub',
    bech32PrefixConsAddr: 'testcorevalcons',
    bech32PrefixConsPub: 'testcorevalconspub',
  },
  currencies: [
    {
      coinDenom: 'TESTCORE',
      coinMinimalDenom: 'utestcore',
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'TESTCORE',
      coinMinimalDenom: 'utestcore',
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.0625,
        average: 0.1,
        high: 0.25,
      },
    },
  ],
};

export const COREUM_MAINNET: NetworkConfig = {
  chainId: 'coreum-mainnet-1',
  chainName: 'Coreum',
  rpc: 'https://full-node.mainnet-1.coreum.dev:26657',
  rest: 'https://full-node.mainnet-1.coreum.dev:1317',
  stakeCurrency: {
    coinDenom: 'CORE',
    coinMinimalDenom: 'ucore',
    coinDecimals: 6,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'core',
    bech32PrefixAccPub: 'corepub',
    bech32PrefixValAddr: 'corevaloper',
    bech32PrefixValPub: 'corevaloperpub',
    bech32PrefixConsAddr: 'corevalcons',
    bech32PrefixConsPub: 'corevalconspub',
  },
  currencies: [
    {
      coinDenom: 'CORE',
      coinMinimalDenom: 'ucore',
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'CORE',
      coinMinimalDenom: 'ucore',
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.0625,
        average: 0.1,
        high: 0.25,
      },
    },
  ],
};

// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES = {
  testnet: {
    flashLoan: process.env.REACT_APP_FLASH_LOAN_CONTRACT_ADDRESS || '',
    simpleReceiver: process.env.REACT_APP_SIMPLE_RECEIVER_CONTRACT_ADDRESS || '',
    ibcReceiver: process.env.REACT_APP_IBC_RECEIVER_CONTRACT_ADDRESS || '',
  },
  mainnet: {
    flashLoan: '',
    simpleReceiver: '',
    ibcReceiver: '',
  },
};

export const DEFAULT_NETWORK: 'testnet' | 'mainnet' = 'testnet';
