import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { CONTRACT_ADDRESSES } from './config';
import './App.css';

interface FlashLoanConfig {
  admin: string | null;
  fee: string;
  loan_denom: {
    native?: { denom: string };
    cw20?: { address: string };
  };
}

function App() {
  const { address, connected, loading, error, connectWallet, disconnectWallet, network, client } = useWallet();
  const [activeTab, setActiveTab] = useState<'provide' | 'withdraw' | 'loan' | 'query'>('provide');
  const [provideAmount, setProvideAmount] = useState('');
  const [loanReceiver, setLoanReceiver] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [queryAddress, setQueryAddress] = useState('');
  const [config, setConfig] = useState<FlashLoanConfig | null>(null);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const contractAddress = CONTRACT_ADDRESSES[network].flashLoan;

  const handleConnect = async () => {
    await connectWallet(network);
  };

  const queryConfig = async () => {
    if (!client || !contractAddress) return;

    try {
      setTxLoading(true);
      setTxError(null);
      const result = await client.queryContractSmart(contractAddress, {
        get_config: {}
      });
      setConfig(result);
      setQueryResult(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Query failed';
      setTxError(errorMsg);
    } finally {
      setTxLoading(false);
    }
  };

  const queryProvided = async () => {
    if (!client || !contractAddress || !queryAddress) return;

    try {
      setTxLoading(true);
      setTxError(null);
      const result = await client.queryContractSmart(contractAddress, {
        provided: { address: queryAddress }
      });
      setQueryResult(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Query failed';
      setTxError(errorMsg);
    } finally {
      setTxLoading(false);
    }
  };

  const queryBalance = async () => {
    if (!client || !contractAddress) return;

    try {
      setTxLoading(true);
      setTxError(null);
      const result = await client.queryContractSmart(contractAddress, {
        balance: {}
      });
      setQueryResult(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Query failed';
      setTxError(errorMsg);
    } finally {
      setTxLoading(false);
    }
  };

  const handleProvide = async () => {
    if (!client || !address || !contractAddress || !provideAmount) return;

    try {
      setTxLoading(true);
      setTxError(null);

      const msg = { provide: {} };
      const funds = [{ denom: network === 'testnet' ? 'utestcore' : 'ucore', amount: provideAmount }];

      const result = await client.execute(
        address,
        contractAddress,
        msg,
        'auto',
        undefined,
        funds
      );

      alert(`Success! Transaction hash: ${result.transactionHash}`);
      setProvideAmount('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setTxError(errorMsg);
    } finally {
      setTxLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!client || !address || !contractAddress) return;

    try {
      setTxLoading(true);
      setTxError(null);

      const msg = { withdraw: {} };

      const result = await client.execute(
        address,
        contractAddress,
        msg,
        'auto'
      );

      alert(`Success! Transaction hash: ${result.transactionHash}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setTxError(errorMsg);
    } finally {
      setTxLoading(false);
    }
  };

  const handleLoan = async () => {
    if (!client || !address || !contractAddress || !loanReceiver || !loanAmount) return;

    try {
      setTxLoading(true);
      setTxError(null);

      const msg = {
        loan: {
          receiver: loanReceiver,
          amount: loanAmount
        }
      };

      const result = await client.execute(
        address,
        contractAddress,
        msg,
        'auto'
      );

      alert(`Success! Transaction hash: ${result.transactionHash}`);
      setLoanReceiver('');
      setLoanAmount('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setTxError(errorMsg);
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Coreum Flash Loan</h1>
        <div className="network-badge">{network.toUpperCase()}</div>
      </header>

      <main className="main">
        {error && <div className="error-banner">{error}</div>}

        <div className="wallet-section">
          {!connected ? (
            <button onClick={handleConnect} disabled={loading} className="connect-button">
              {loading ? 'Connecting...' : 'Connect Keplr Wallet'}
            </button>
          ) : (
            <div className="wallet-info">
              <div className="address">
                <span className="label">Connected:</span>
                <span className="value">{address}</span>
              </div>
              <button onClick={disconnectWallet} className="disconnect-button">
                Disconnect
              </button>
            </div>
          )}
        </div>

        {!contractAddress && connected && (
          <div className="warning-banner">
            Contract address not configured for {network}. Please update CONTRACT_ADDRESSES in config.ts
          </div>
        )}

        {connected && contractAddress && (
          <>
            <div className="contract-info">
              <h3>Flash Loan Contract</h3>
              <div className="info-item">
                <span className="label">Address:</span>
                <span className="value">{contractAddress}</span>
              </div>
              {config && (
                <>
                  <div className="info-item">
                    <span className="label">Fee:</span>
                    <span className="value">{config.fee}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Denom:</span>
                    <span className="value">
                      {config.loan_denom.native?.denom || config.loan_denom.cw20?.address}
                    </span>
                  </div>
                </>
              )}
              <button onClick={queryConfig} disabled={txLoading} className="query-button">
                {txLoading ? 'Loading...' : 'Refresh Config'}
              </button>
            </div>

            <div className="tabs">
              <button
                className={`tab ${activeTab === 'provide' ? 'active' : ''}`}
                onClick={() => setActiveTab('provide')}
              >
                Provide Liquidity
              </button>
              <button
                className={`tab ${activeTab === 'withdraw' ? 'active' : ''}`}
                onClick={() => setActiveTab('withdraw')}
              >
                Withdraw
              </button>
              <button
                className={`tab ${activeTab === 'loan' ? 'active' : ''}`}
                onClick={() => setActiveTab('loan')}
              >
                Request Loan
              </button>
              <button
                className={`tab ${activeTab === 'query' ? 'active' : ''}`}
                onClick={() => setActiveTab('query')}
              >
                Query
              </button>
            </div>

            <div className="tab-content">
              {txError && <div className="error-message">{txError}</div>}

              {activeTab === 'provide' && (
                <div className="form">
                  <h3>Provide Liquidity</h3>
                  <p>Provide tokens to earn fees from flash loans</p>
                  <input
                    type="number"
                    placeholder="Amount (in smallest unit)"
                    value={provideAmount}
                    onChange={(e) => setProvideAmount(e.target.value)}
                    className="input"
                  />
                  <button
                    onClick={handleProvide}
                    disabled={txLoading || !provideAmount}
                    className="action-button"
                  >
                    {txLoading ? 'Processing...' : 'Provide'}
                  </button>
                </div>
              )}

              {activeTab === 'withdraw' && (
                <div className="form">
                  <h3>Withdraw Liquidity</h3>
                  <p>Withdraw your provided tokens plus earned fees</p>
                  <button
                    onClick={handleWithdraw}
                    disabled={txLoading}
                    className="action-button"
                  >
                    {txLoading ? 'Processing...' : 'Withdraw All'}
                  </button>
                </div>
              )}

              {activeTab === 'loan' && (
                <div className="form">
                  <h3>Request Flash Loan</h3>
                  <p>Request a flash loan (must be repaid in same transaction)</p>
                  <input
                    type="text"
                    placeholder="Receiver Contract Address"
                    value={loanReceiver}
                    onChange={(e) => setLoanReceiver(e.target.value)}
                    className="input"
                  />
                  <input
                    type="number"
                    placeholder="Amount (in smallest unit)"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="input"
                  />
                  <button
                    onClick={handleLoan}
                    disabled={txLoading || !loanReceiver || !loanAmount}
                    className="action-button"
                  >
                    {txLoading ? 'Processing...' : 'Request Loan'}
                  </button>
                </div>
              )}

              {activeTab === 'query' && (
                <div className="form">
                  <h3>Query Contract</h3>
                  <div className="query-section">
                    <h4>Query Provided Amount</h4>
                    <input
                      type="text"
                      placeholder="Address"
                      value={queryAddress}
                      onChange={(e) => setQueryAddress(e.target.value)}
                      className="input"
                    />
                    <button
                      onClick={queryProvided}
                      disabled={txLoading || !queryAddress}
                      className="query-button"
                    >
                      Query Provided
                    </button>
                  </div>
                  <div className="query-section">
                    <h4>Query Contract Balance</h4>
                    <button
                      onClick={queryBalance}
                      disabled={txLoading}
                      className="query-button"
                    >
                      Query Balance
                    </button>
                  </div>
                  {queryResult && (
                    <div className="query-result">
                      <h4>Result:</h4>
                      <pre>{JSON.stringify(queryResult, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <p>Coreum Flash Loan - Decentralized Flash Loans on Coreum Network</p>
        <p>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          {' | '}
          <a href="https://www.coreum.com" target="_blank" rel="noopener noreferrer">Coreum</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
