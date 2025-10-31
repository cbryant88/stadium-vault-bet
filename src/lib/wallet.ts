import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

// Safe wallet configuration with fallbacks
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'YOUR_WALLET_CONNECT_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'Stadium Vault Bet',
  projectId: projectId,
  chains: [sepolia],
  // 强制 wagmi 使用我们配置的 RPC，避免随机公共节点 429/限流
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_RPC_URL || 'https://1rpc.io/sepolia'),
  },
  ssr: false,
  appDescription: 'FHE Encrypted Sports Betting Platform',
  appUrl: 'https://stadium-vault-bet.vercel.app',
  appIcon: 'https://stadium-vault-bet.vercel.app/logo.svg',
});

// Add error handling for wallet connection issues
if (typeof window !== 'undefined') {
  // Prevent multiple wallet injections
  if (window.ethereum && !window.ethereum._isMetaMask) {
    console.warn('Multiple wallet providers detected');
  }
}

