// Development configuration to avoid wallet connection issues
export const isDevelopment = import.meta.env.DEV;

export const devConfig = {
  // Mock wallet connection for development
  mockWallet: isDevelopment && !window.ethereum,
  
  // Development-specific settings
  enableMockData: isDevelopment,
  
  // Error handling
  suppressWalletErrors: isDevelopment,
};
