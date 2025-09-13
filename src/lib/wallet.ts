import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

// Safe wallet configuration with fallbacks
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'YOUR_WALLET_CONNECT_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'Stadium Vault Bet',
  projectId: projectId,
  chains: [sepolia],
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

