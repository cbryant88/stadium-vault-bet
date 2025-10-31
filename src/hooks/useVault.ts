import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { fheContractService } from '../lib/fheContractService';
import { useEthersSigner } from './useEthersSigner';

export function useVault() {
  const { address, isConnected } = useAccount();
  const { getSigner } = useEthersSigner();
  const [vaultBalance, setVaultBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVaultBalance = useCallback(async () => {
    if (!address || !isConnected) {
      setVaultBalance('0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const balance = await fheContractService.getVaultBalance(address);
      setVaultBalance(balance);
    } catch (err) {
      console.error('Error loading vault balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vault balance');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  const depositToVault = useCallback(async (amount: string | number) => {
    if (!address || !isConnected || !getSigner) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);
      // Get signer from wagmi
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Signer not available');
      }
      await fheContractService.depositToVault(amount, signer);
      // Reload balance after deposit
      await loadVaultBalance();
    } catch (err) {
      console.error('Error depositing to vault:', err);
      setError(err instanceof Error ? err.message : 'Failed to deposit to vault');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, getSigner, loadVaultBalance]);

  const withdrawFromVault = useCallback(async (amount: string | number) => {
    if (!address || !isConnected || !getSigner) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);
      // Get signer from wagmi
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Signer not available');
      }
      await fheContractService.withdrawFromVault(amount, signer);
      // Reload balance after withdrawal
      await loadVaultBalance();
    } catch (err) {
      console.error('Error withdrawing from vault:', err);
      setError(err instanceof Error ? err.message : 'Failed to withdraw from vault');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, getSigner, loadVaultBalance]);

  // Load vault balance when address changes
  useEffect(() => {
    loadVaultBalance();
  }, [loadVaultBalance]);

  return {
    vaultBalance,
    loading,
    error,
    depositToVault,
    withdrawFromVault,
    loadVaultBalance
  };
}
