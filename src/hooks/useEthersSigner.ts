import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useMemo } from 'react';

export function useEthersSigner() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const signerPromise = useMemo(async () => {
    if (!isConnected || !walletClient) {
      return null;
    }

    const { account, chain, transport } = walletClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, account.address);
    return signer;
  }, [isConnected, walletClient]);

  return {
    address,
    isConnected,
    signerPromise,
    walletClient
  };
}
