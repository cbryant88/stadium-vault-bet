import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Stadium Vault Bet',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'YOUR_WALLET_CONNECT_PROJECT_ID',
  chains: [sepolia],
  ssr: false,
  appDescription: 'FHE Encrypted Sports Betting Platform',
  appUrl: 'https://stadium-vault-bet.vercel.app',
  appIcon: 'https://stadium-vault-bet.vercel.app/logo.svg',
});

