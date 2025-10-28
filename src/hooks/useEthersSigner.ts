import { useAccount, useWalletClient } from 'wagmi';
import { useMemo } from 'react';

export function useEthersSigner() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const signerPromise = useMemo(() => {
    if (!isConnected || !walletClient) {
      return null;
    }

    return Promise.resolve(walletClient);
  }, [isConnected, walletClient]);

  return {
    address,
    isConnected,
    signerPromise,
    walletClient
  };
}
