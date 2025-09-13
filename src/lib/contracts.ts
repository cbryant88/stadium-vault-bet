import { Address } from 'viem';

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  StadiumVaultBet: '0x0000000000000000000000000000000000000000' as Address,
} as const;

// Contract ABIs will be generated after compilation
export const CONTRACT_ABIS = {
  StadiumVaultBet: [] as const,
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 11155111, // Sepolia
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY',
} as const;