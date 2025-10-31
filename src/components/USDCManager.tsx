import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { fheContractService } from '../lib/fheContractService';
import { useVault } from '../hooks/useVault';
import { useEthersSigner } from '../hooks/useEthersSigner';

interface USDCManagerProps {
  onBalanceUpdate?: (balance: string) => void;
}

export const USDCManager: React.FC<USDCManagerProps> = ({ onBalanceUpdate }) => {
  const { address } = useAccount();
  const { getSigner } = useEthersSigner();
  const { vaultBalance, depositToVault, withdrawFromVault, loadVaultBalance, loading: vaultLoading, error: vaultError } = useVault();
  const [userBalance, setUserBalance] = useState<string>('0');
  const [faucetAmount, setFaucetAmount] = useState<string>('100');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalances = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userBal = await fheContractService.getUSDCBalance(address);
      setUserBalance(userBal);
      
      // Load vault balance using the hook
      await loadVaultBalance();
      
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
    console.log('🔄 handleFaucet called', { address: !!address, getSigner: !!getSigner, faucetAmount });
    
    if (!address) {
      console.warn('⚠️ No address available');
      setError('Please connect your wallet first');
      return;
    }
    
    if (!getSigner) {
      console.warn('⚠️ getSigner not available');
      setError('Wallet signer not available. Please reconnect your wallet.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Getting signer from wagmi...');
      
      // Get signer from wagmi
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Signer not available');
      }
      
      console.log('✅ Signer obtained, calling faucetUSDC...');
      await fheContractService.faucetUSDC(faucetAmount, signer);
      
      console.log('✅ Faucet successful, reloading balances...');
      await loadBalances();
      
      console.log('✅ Successfully claimed USDC!');
      alert(`Successfully claimed ${faucetAmount} USDC!`);
    } catch (err) {
      console.error('❌ Error claiming USDC:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim USDC');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepositToVault = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await depositToVault(depositAmount);
      await loadBalances();
      
      alert(`Successfully deposited ${depositAmount} USDC to vault!`);
      setDepositAmount('');
    } catch (err) {
      console.error('Error depositing to vault:', err);
      setError(err instanceof Error ? err.message : 'Failed to deposit to vault');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawFromVault = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await withdrawFromVault(withdrawAmount);
      await loadBalances();
      
      alert(`Successfully withdrew ${withdrawAmount} USDC from vault!`);
      setWithdrawAmount('');
    } catch (err) {
      console.error('Error withdrawing from vault:', err);
      setError(err instanceof Error ? err.message : 'Failed to withdraw from vault');
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
      
      {(error || vaultError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || vaultError}
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
            <h4 className="font-medium text-gray-700">Your Vault Balance</h4>
            <p className="text-2xl font-bold text-blue-600">
              {(isLoading || vaultLoading) ? '...' : `${vaultBalance} USDC`}
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
          <h4 className="font-medium text-gray-700 mb-3">Vault Management</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit to Vault</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-500"
                  placeholder="Amount to deposit"
                  min="0.000001"
                  step="0.000001"
                />
                <button
                  onClick={handleDepositToVault}
                  disabled={isLoading || vaultLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Depositing...' : 'Deposit'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Withdraw from Vault</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-500"
                  placeholder="Amount to withdraw"
                  min="0.000001"
                  step="0.000001"
                />
                <button
                  onClick={handleWithdrawFromVault}
                  disabled={isLoading || vaultLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Withdrawing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
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
