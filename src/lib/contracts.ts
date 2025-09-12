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
  chainId: 11155111, // Sepolia
  rpcUrl: 'https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990',
} as const;