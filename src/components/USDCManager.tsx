import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { fheContractService } from '../lib/fheContractService';

interface USDCManagerProps {
  onBalanceUpdate?: (balance: string) => void;
}

export const USDCManager: React.FC<USDCManagerProps> = ({ onBalanceUpdate }) => {
  const { address } = useAccount();
  const [userBalance, setUserBalance] = useState<string>('0');
  const [vaultBalance, setVaultBalance] = useState<string>('0');
  const [faucetAmount, setFaucetAmount] = useState<string>('100');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalances = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [userBal, vaultBal] = await Promise.all([
        fheContractService.getUSDCBalance(address),
        fheContractService.getVaultUSDCBalance()
      ]);
      
      setUserBalance(userBal);
      setVaultBalance(vaultBal);
      
      if (onBalanceUpdate) {
        onBalanceUpdate(userBal);
      }
    } catch (err) {
      console.error('Error loading balances:', err);
      setError('Failed to load balances');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaucet = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await fheContractService.faucetUSDC(faucetAmount);
      await loadBalances();
      
      alert(`Successfully claimed ${faucetAmount} USDC!`);
    } catch (err) {
      console.error('Error claiming USDC:', err);
      setError('Failed to claim USDC');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, [address]);

  if (!address) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">USDC Manager</h3>
        <p className="text-gray-600">Please connect your wallet to manage USDC</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">USDC Manager</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium text-gray-700">Your Balance</h4>
            <p className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : `${userBalance} USDC`}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium text-gray-700">Vault Balance</h4>
            <p className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : `${vaultBalance} USDC`}
            </p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-3">Claim Test USDC</h4>
          <div className="flex gap-2">
            <input
              type="number"
              value={faucetAmount}
              onChange={(e) => setFaucetAmount(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-500"
              placeholder="Amount to claim"
              min="1"
              max="1000"
            />
            <button
              onClick={handleFaucet}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Claiming...' : 'Claim USDC'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Maximum 1000 USDC per claim. This is test USDC for development purposes.
          </p>
        </div>
        
        <div className="border-t pt-4">
          <button
            onClick={loadBalances}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Refresh Balances'}
          </button>
        </div>
      </div>
    </div>
  );
};
