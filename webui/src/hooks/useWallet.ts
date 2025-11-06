import { useState, useEffect, useCallback } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import { COREUM_TESTNET, COREUM_MAINNET, NetworkConfig } from '../config';

declare global {
  interface Window extends KeplrWindow {}
}

interface WalletState {
  address: string | null;
  client: SigningCosmWasmClient | null;
  connected: boolean;
  network: 'testnet' | 'mainnet';
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    client: null,
    connected: false,
    network: 'testnet',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNetworkConfig = useCallback((network: 'testnet' | 'mainnet'): NetworkConfig => {
    return network === 'testnet' ? COREUM_TESTNET : COREUM_MAINNET;
  }, []);

  const connectWallet = useCallback(async (network: 'testnet' | 'mainnet' = 'testnet') => {
    setLoading(true);
    setError(null);

    try {
      if (!window.keplr) {
        throw new Error('Please install Keplr wallet extension');
      }

      const networkConfig = getNetworkConfig(network);

      // Suggest chain to Keplr
      try {
        await window.keplr.experimentalSuggestChain({
          chainId: networkConfig.chainId,
          chainName: networkConfig.chainName,
          rpc: networkConfig.rpc,
          rest: networkConfig.rest,
          bip44: {
            coinType: 990,
          },
          bech32Config: networkConfig.bech32Config,
          currencies: networkConfig.currencies,
          feeCurrencies: networkConfig.feeCurrencies,
          stakeCurrency: networkConfig.stakeCurrency,
          coinType: 990,
          gasPriceStep: networkConfig.feeCurrencies[0].gasPriceStep,
        });
      } catch (e) {
        console.log('Chain suggestion failed, might already exist:', e);
      }

      await window.keplr.enable(networkConfig.chainId);

      const offlineSigner = window.keplr.getOfflineSigner(networkConfig.chainId);
      const accounts = await offlineSigner.getAccounts();

      const client = await SigningCosmWasmClient.connectWithSigner(
        networkConfig.rpc,
        offlineSigner,
        {
          gasPrice: {
            amount: networkConfig.feeCurrencies[0].gasPriceStep.average.toString(),
            denom: networkConfig.feeCurrencies[0].coinMinimalDenom,
          },
        }
      );

      setWallet({
        address: accounts[0].address,
        client,
        connected: true,
        network,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  }, [getNetworkConfig]);

  const disconnectWallet = useCallback(() => {
    setWallet({
      address: null,
      client: null,
      connected: false,
      network: 'testnet',
    });
  }, []);

  useEffect(() => {
    const handleAccountChange = () => {
      if (wallet.connected) {
        disconnectWallet();
      }
    };

    if (window.keplr) {
      window.addEventListener('keplr_keystorechange', handleAccountChange);
    }

    return () => {
      if (window.keplr) {
        window.removeEventListener('keplr_keystorechange', handleAccountChange);
      }
    };
  }, [wallet.connected, disconnectWallet]);

  return {
    ...wallet,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  };
};
