import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { useCallback } from 'react';

export function useEthersSigner() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const getSigner = useCallback(async () => {
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    // 类型转换以解决兼容性问题
    const provider = new BrowserProvider(walletClient as any);
    return await provider.getSigner();
  }, [walletClient]); // 依赖 walletClient，避免无限循环

  return {
    address,
    signer: walletClient,
    isConnected: !!address && !!walletClient,
    getSigner
  };
}
